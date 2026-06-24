chrome.storage.local.get(['lensImage'], async (result) => {
  if (!result.lensImage) return;
  
  // Convert the base64 string back into a Blob
  const res = await fetch(result.lensImage);
  const blob = await res.blob();
  
  // Dynamically create a form pointing to Google Lens
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://lens.google.com/v3/upload?hl=en&re=df&stcs=1&ep=gsbubb';
  form.enctype = 'multipart/form-data';
  
  // Use DataTransfer to programmatically attach the Blob to a file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.name = 'encoded_image';
  
  const dt = new DataTransfer();
  dt.items.add(new File([blob], 'screenshot.jpg', { type: blob.type }));
  fileInput.files = dt.files;
  
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.name = 'image_content';
  hiddenInput.value = '';
  
  form.appendChild(fileInput);
  form.appendChild(hiddenInput);
  document.body.appendChild(form);
  
  // Clean up storage to save memory
  chrome.storage.local.remove('lensImage');
  
  // Instantly submit the form. The browser will take over the navigation,
  // handle the 2-second upload natively, and follow the redirect to the results automatically!
  form.submit();
});
