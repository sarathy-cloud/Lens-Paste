document.addEventListener("DOMContentLoaded", async () => {
  const previewImage = document.getElementById("preview-image");
  const noImageText = document.getElementById("no-image-text");
  const searchBtn = document.getElementById("search-btn");
  const statusEl = document.getElementById("status");

  let clipboardBlob = null;

  function setStatus(text, isError = false) {
    statusEl.textContent = text;
    statusEl.style.color = isError ? "#ff5555" : "#aaaaaa";
  }

  async function loadClipboardImage() {
    try {
      let clipboardItems;
      // Retry reading clipboard up to 5 times. 
      // This works around the "Document is not focused" timing issue that often happens when a popup first opens.
      for (let i = 0; i < 5; i++) {
        try {
          if (!document.hasFocus()) {
            window.focus();
          }
          clipboardItems = await navigator.clipboard.read();
          break; // Success
        } catch (err) {
          if (i === 4) throw err;
          await new Promise(res => setTimeout(res, 100)); // Wait 100ms and try again
        }
      }

      let foundImage = false;
      for (const item of clipboardItems) {
        const imageTypes = Array.from(item.types).filter(type => 
          typeof type === 'string' && type.indexOf('image/') === 0
        );
        if (imageTypes.length > 0) {
          clipboardBlob = await item.getType(imageTypes[0]);
          foundImage = true;
          break;
        }
      }

      if (foundImage && clipboardBlob) {
        const objectUrl = URL.createObjectURL(clipboardBlob);
        previewImage.src = objectUrl;
        previewImage.style.display = "block";
        noImageText.style.display = "none";
        setStatus("Processing image...");

        // Compress the image right away while the user is looking at the popup
        clipboardBlob = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.85); 
          };
          img.src = objectUrl;
        });

        searchBtn.disabled = false;
        setStatus("Image ready.");
      } else {
        setStatus("No image found in clipboard.");
      }
    } catch (err) {
      console.error(err);
      // Display the actual error message so we know what failed if it still fails
      setStatus("Clipboard error: " + (err.message || err), true);
    }
  }

  // Initial load
  loadClipboardImage();

  searchBtn.addEventListener("click", async () => {
    if (!clipboardBlob) return;
    
    searchBtn.disabled = true;
    setStatus("Uploading to Google Lens...");
    
    try {
      // Instantly convert the pre-compressed blob to a Data URL
      const reader = new FileReader();
      reader.onload = () => {
        const base64data = reader.result;
        
        // Save to local storage for upload.html to pick up
        chrome.storage.local.set({ lensImage: base64data }, () => {
          const uploadUrl = chrome.runtime.getURL('upload.html');
          
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const isHomeTab = currentTab && (
              currentTab.url === "chrome://newtab/" ||
              currentTab.url === "edge://newtab/" ||
              currentTab.url === "about:blank" ||
              !currentTab.url ||
              currentTab.url.startsWith("chrome://") && currentTab.url.includes("newtab")
            );

            // Open our upload bridge page in the target tab
            if (isHomeTab) {
              chrome.tabs.update(currentTab.id, { url: uploadUrl });
            } else {
              chrome.tabs.create({ url: uploadUrl });
            }
            
            // Instantly close the popup! The user feels 0 delay.
            window.close();
          });
        });
      };
      reader.readAsDataURL(clipboardBlob);
    } catch (err) {
      setStatus("Error: " + err.message, true);
      searchBtn.disabled = false;
    }
  });
});
