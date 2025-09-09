// Bitcoin Wallet Descriptor Splitter
class ShamirSplitter {
  constructor() {
    this.shares = [];
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Split button
    document.getElementById("split-btn").addEventListener("click", () => {
      this.splitDescriptor();
    });

    // Enter key in textarea
    document
      .getElementById("wallet-descriptor")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
          this.splitDescriptor();
        }
      });

    // Download all button
    document
      .getElementById("download-all-btn")
      .addEventListener("click", () => {
        this.downloadAllShares();
      });

    // Reconstruction functionality
    document.getElementById("reconstruct-btn").addEventListener("click", () => {
      this.reconstructDescriptor();
    });

    document
      .getElementById("copy-reconstructed-btn")
      .addEventListener("click", () => {
        this.copyReconstructedToClipboard();
      });
  }

  splitDescriptor() {
    const descriptor = document
      .getElementById("wallet-descriptor")
      .value.trim();

    if (!descriptor) {
      alert("Please enter a wallet descriptor first.");
      return;
    }

    if (!this.isValidDescriptor(descriptor)) {
      alert(
        "This doesn't look like a valid Bitcoin wallet descriptor. Please check your input."
      );
      return;
    }

    try {
      // Convert descriptor to hex for Shamir processing
      const hexSecret = secrets.str2hex(descriptor);

      // Split into 3 shares with threshold of 2
      this.shares = secrets.share(hexSecret, 3, 2);

      // Display the shares
      this.displayShares(descriptor);

      // Show shares section
      const sharesSection = document.getElementById("shares-section");
      sharesSection.classList.remove("hidden");

      // Scroll to shares
      sharesSection.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Error splitting descriptor:", error);
      alert("Error processing wallet descriptor. Please try again.");
    }
  }

  isValidDescriptor(descriptor) {
    // Basic validation for common Bitcoin descriptor patterns
    const patterns = [
      /^wpkh\(/, // Pay-to-witness-public-key-hash
      /^wsh\(/, // Pay-to-witness-script-hash
      /^pkh\(/, // Pay-to-public-key-hash
      /^sh\(/, // Pay-to-script-hash
      /^tr\(/, // Pay-to-taproot
      /^multi\(/, // Multi-signature
      /^sortedmulti\(/, // Sorted multi-signature
    ];

    return patterns.some((pattern) => pattern.test(descriptor));
  }

  displayShares(originalDescriptor) {
    const sharesGrid = document.querySelector(".shares-grid");
    sharesGrid.innerHTML = "";

    this.shares.forEach((share, index) => {
      const shareCard = this.createShareCard(
        share,
        index + 1,
        originalDescriptor
      );
      sharesGrid.appendChild(shareCard);
    });
  }

  createShareCard(share, shareNumber, originalDescriptor) {
    const card = document.createElement("div");
    card.className = "share-card";

    const textSectionId = `text-${shareNumber}`;

    card.innerHTML = `
            <div class="share-header">
                <div class="share-title">Share ${shareNumber}</div>
                <button class="share-visibility-toggle eye-closed"
                        data-section="${textSectionId}"
                        data-type="text"
                        id="btn-${textSectionId}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>

            <div class="share-content-area" data-section="${textSectionId}" id="area-${textSectionId}">
                <textarea class="text-content" data-share-text="${btoa(
                  share
                )}" data-hidden="true" readonly>••••••••••••••••••••••••••••••••••••••••••••••••••</textarea>
            </div>

            <div class="share-actions">
                <button class="copy-btn" onclick="shamirSplitter.copyShare(${
                  shareNumber - 1
                })">
                    Copy
                </button>
                <button class="download-btn" onclick="shamirSplitter.downloadShare(${
                  shareNumber - 1
                })">
                    Download
                </button>
            </div>
        `;

    // Bind visibility toggles
    const buttons = card.querySelectorAll(".share-visibility-toggle");

    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // The click might be on the SVG inside the button, so find the actual button
        const actualButton = e.target.closest(".share-visibility-toggle");

        e.preventDefault();
        e.stopPropagation();

        if (!actualButton) {
          return;
        }

        const section = actualButton.dataset.section;
        const type = actualButton.dataset.type;

        // Find the parent card
        const card = actualButton.closest(".share-card");

        if (!card) {
          return;
        }

        this.toggleShareSectionVisibility(section, type, card);
      });
    });

    return card;
  }

  toggleShareSectionVisibility(sectionId, type, card) {
    // Find content area by its specific ID
    const contentArea = card.querySelector(`#area-${sectionId}`);

    if (!contentArea) {
      return;
    }

    // Find the toggle button by its ID
    const toggleBtn = card.querySelector(`#btn-${sectionId}`);

    if (!toggleBtn) {
      return;
    }

    if (type === "text") {
      const textContent = contentArea.querySelector(".text-content");

      if (!textContent) {
        return;
      }

      const isHidden = textContent.dataset.hidden === "true";

      if (isHidden) {
        // Show actual text
        const encodedText = textContent.dataset.shareText;
        const originalText = atob(encodedText);
        textContent.value = originalText;
        textContent.dataset.hidden = "false";
        toggleBtn.classList.remove("eye-closed");
        toggleBtn.classList.add("eye-open");
        toggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        // Hide text with dots
        textContent.value =
          "••••••••••••••••••••••••••••••••••••••••••••••••••";
        textContent.dataset.hidden = "true";
        toggleBtn.classList.remove("eye-open");
        toggleBtn.classList.add("eye-closed");
        toggleBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    }
  }

  // Reconstruction functionality
  reconstructDescriptor() {
    const share1 = document.getElementById("share1-input").value.trim();
    const share2 = document.getElementById("share2-input").value.trim();

    // Clear any previous error messages
    this.hideErrorMessage();

    if (!share1 || !share2) {
      this.showErrorMessage(
        "Please provide both shares to reconstruct the wallet descriptor."
      );
      return;
    }

    const shares = [share1, share2];

    try {
      // Reconstruct the wallet descriptor
      const reconstructedHex = secrets.combine(shares);
      const reconstructedDescriptor = secrets.hex2str(reconstructedHex);

      // Display the result
      document.getElementById("reconstructed-text").textContent =
        reconstructedDescriptor;
      document
        .getElementById("reconstructed-result")
        .classList.remove("hidden");

      // Scroll to result
      document.getElementById("reconstructed-result").scrollIntoView({
        behavior: "smooth",
      });

      this.showSuccessMessage("Wallet descriptor successfully reconstructed!");
    } catch (error) {
      console.error("Error reconstructing descriptor:", error);
      this.showErrorMessage(
        "Error reconstructing wallet descriptor. Please check that your shares are valid and complete."
      );
    }
  }

  showErrorMessage(message) {
    this.hideErrorMessage(); // Remove any existing message first

    const errorDiv = document.createElement("div");
    errorDiv.id = "reconstruction-error";
    errorDiv.className = "error-message";
    errorDiv.textContent = message;

    const reconstructBtn = document.getElementById("reconstruct-btn");
    reconstructBtn.parentNode.insertBefore(
      errorDiv,
      reconstructBtn.nextSibling
    );

    // Auto-hide after 5 es
    setTimeout(() => this.hideErrorMessage(), 5000);
  }

  showSuccessMessage(message) {
    this.hideErrorMessage(); // Remove any existing message first

    const successDiv = document.createElement("div");
    successDiv.id = "reconstruction-success";
    successDiv.className = "success-message";
    successDiv.textContent = message;

    const reconstructBtn = document.getElementById("reconstruct-btn");
    reconstructBtn.parentNode.insertBefore(
      successDiv,
      reconstructBtn.nextSibling
    );

    // Auto-hide after 3 seconds
    setTimeout(() => this.hideErrorMessage(), 3000);
  }

  hideErrorMessage() {
    const errorMsg = document.getElementById("reconstruction-error");
    const successMsg = document.getElementById("reconstruction-success");
    if (errorMsg) errorMsg.remove();
    if (successMsg) successMsg.remove();
  }

  copyReconstructedToClipboard() {
    const text = document.getElementById("reconstructed-text").textContent;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Wallet descriptor copied to clipboard!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Wallet descriptor copied to clipboard!");
      });
  }

  downloadShare(shareIndex) {
    const share = this.shares[shareIndex];
    const filename = `bitcoin-share-${shareIndex + 1}.txt`;

    const blob = new Blob([share], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();

    // Clean up
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }

  copyShare(shareIndex) {
    const share = this.shares[shareIndex];

    // Use modern clipboard API if available, fallback to old method
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(share)
        .then(() => {
          alert(`Share ${shareIndex + 1} copied to clipboard!`);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          this.fallbackCopyTextToClipboard(share);
        });
    } else {
      this.fallbackCopyTextToClipboard(share);
    }
  }

  fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        alert("Share copied to clipboard!");
      } else {
        alert("Failed to copy share");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      alert("Failed to copy share");
    }

    document.body.removeChild(textArea);
  }

  downloadAllShares() {
    const zipContent = this.shares
      .map((share, index) => `Share ${index + 1}:\n${share}\n\n`)
      .join("");

    const filename = "bitcoin-shares-all.txt";
    const blob = new Blob([zipContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();

    // Clean up
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }
}

// Check if all required libraries are loaded
function checkLibraries() {
  const libraries = [{ name: "secrets", obj: typeof secrets !== "undefined" }];

  const missing = libraries.filter((lib) => !lib.obj);
  return {
    allLoaded: missing.length === 0,
    missing: missing,
    loaded: libraries.filter((lib) => lib.obj),
  };
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Give libraries 3 seconds to load, then proceed anyway
  let attempts = 0;
  const maxAttempts = 30; // 3 seconds at 100ms intervals

  const checkInterval = setInterval(() => {
    attempts++;
    const status = checkLibraries();

    if (status.allLoaded) {
      clearInterval(checkInterval);
      window.shamirSplitter = new ShamirSplitter();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      window.shamirSplitter = new ShamirSplitter();
    }
  }, 100);
});
