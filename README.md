# Lens Paste

Lens Paste is a Google Chrome extension that allows you to instantly search images from your system clipboard on Google Lens with a single click.

## Features

- **Clipboard Preview**: View the image currently stored in your clipboard directly within the extension popup.
- **Instant Search**: Click the search button to instantly upload and transition your clipboard image to Google Lens.
- **Fast Upload**: Automatic client-side JPEG compression balances upload size and image quality for optimal performance.
- **Smooth Navigation**: Seamless background tab manipulation avoids polluting your browsing space with empty tabs during upload.

## Installation

To install the extension locally in developer mode:

1. Download or clone this repository to a local directory.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the directory containing the extension files.

## Usage Guide

1. Pin the extension to your browser toolbar for quick access.
2. Copy an image to your clipboard. For example:
   - Take a screenshot using **Win + Shift + S** (Windows) or **Cmd + Shift + 4** (macOS).
   - Right-click an image on a webpage and select **Copy Image**.
3. Click the **Lens Paste** icon on your browser toolbar.
4. The extension will display a preview of the image. Click **Search Clipboard Image** to search the image on Google Lens.

## Architecture

- **manifest.json**: Configuration and metadata declaring permissions (clipboardRead, storage, tabs, declarativeNetRequest) and the background service worker.
- **popup.html / popup.js**: Interactive popup UI showing the clipboard image preview, handling compression, and starting the upload flow.
- **upload.html / upload.js**: Secondary bridge page that receives the base64 image data and performs the HTTP multipart POST upload to Google Lens.
- **background.js**: Service worker managing runtime actions and opening the onboarding page upon installation.
- **rules.json**: Declarative Net Request rules configuring headers for Lens interaction.
