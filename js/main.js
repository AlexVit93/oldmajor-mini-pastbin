document.addEventListener("DOMContentLoaded", function () {
  const saveBtn = document.getElementById("save-btn");
  const btnText = document.getElementById("btn-text");
  const loader = document.getElementById("loader");
  const codeTextarea = document.getElementById("code");
  const languageSelect = document.getElementById("language");
  const resultDiv = document.getElementById("result");
  const shareLink = document.getElementById("share-link");
  const copyBtn = document.getElementById("copy-btn");
  const copyCodeBtn = document.getElementById("copy-code-btn");
  const shortenBtn = document.getElementById("shorten-btn");
  const shortLinkContainer = document.getElementById("short-link-container");
  const shortLink = document.getElementById("short-link");
  const copyShortBtn = document.getElementById("copy-short-btn");
  const notification = document.getElementById("notification");
  const errorDiv = document.getElementById("error");

  const API_KEY =
    "$2a$10$hOrcaQAGTIU.l5eETxKJt.oufAU/58xqkaMI8Hc/Mz7Obrvk8E7N2";

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (id) {
    loadCode(id);
  } else {
    codeTextarea.focus();
  }

  copyCodeBtn.addEventListener("click", function () {
    const code = codeTextarea.value;
    if (code) {
      navigator.clipboard.writeText(code).then(function () {
        showNotification("Code copied to clipboard!");
      });
    }
  });

  saveBtn.addEventListener("click", function () {
    const code = codeTextarea.value.trim();

    if (!code) {
      alert("Пожалуйста, введите код для сохранения");
      return;
    }

    saveBtn.disabled = true;
    loader.style.display = "inline-block";
    btnText.textContent = "Сохранение...";
    errorDiv.style.display = "none";
    shortLinkContainer.style.display = "none";

    fetch("https://api.jsonbin.io/v3/b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
        "X-Bin-Name": "Code Snippet",
        "X-Bin-Private": "false",
      },
      body: JSON.stringify({
        code: code,
        created: new Date().toISOString(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.metadata && data.metadata.id) {
          const shareUrl =
            window.location.origin +
            window.location.pathname +
            "?id=" +
            data.metadata.id;
          shareLink.textContent = shareUrl;
          shareLink.setAttribute("data-url", shareUrl);
          resultDiv.style.display = "block";

          resultDiv.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(
            {},
            document.title,
            "?id=" + data.metadata.id
          );
        } else {
          throw new Error("Не удалось сохранить код");
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        errorDiv.style.display = "block";
        errorDiv.textContent = "Ошибка: " + error.message;
      })
      .finally(() => {
        saveBtn.disabled = false;
        loader.style.display = "none";
        btnText.textContent = "Сохранить код";
      });
  });

  copyBtn.addEventListener("click", function () {
    const url = shareLink.getAttribute("data-url");
    copyToClipboard(url);
  });

  copyShortBtn.addEventListener("click", function () {
    const url = shortLink.getAttribute("data-url");
    copyToClipboard(url);
  });

  shortenBtn.addEventListener("click", function () {
    const originalUrl = shareLink.getAttribute("data-url");
    const hash = Math.random().toString(36).substring(2, 10);
    const shortUrl = `https://psb.in/${hash}`;

    shortLink.textContent = shortUrl;
    shortLink.setAttribute("data-url", shortUrl);
    shortLinkContainer.style.display = "block";
    showNotification("Short link created!");
  });

  function loadCode(id) {
    saveBtn.disabled = true;
    loader.style.display = "inline-block";
    btnText.textContent = "Загрузка...";

    fetch(`https://api.jsonbin.io/v3/b/${id}`, {
      headers: {
        "X-Master-Key": API_KEY,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.record && data.record.code) {
          codeTextarea.value = data.record.code;
          codeTextarea.readOnly = true;
          saveBtn.style.display = "none";
          const shareUrl = window.location.href;
          shareLink.textContent = shareUrl;
          shareLink.setAttribute("data-url", shareUrl);
          resultDiv.style.display = "block";
        } else {
          codeTextarea.value =
            "Код не найден. Возможно, он был удален или срок хранения истек.";
          codeTextarea.readOnly = true;
          saveBtn.disabled = true;
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        codeTextarea.value = "Произошла ошибка при загрузке кода.";
        codeTextarea.readOnly = true;
        saveBtn.disabled = true;
      })
      .finally(() => {
        loader.style.display = "none";
        btnText.textContent = "Сохранить код";
      });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
      showNotification("Link copied to clipboard!");
    });
  }

  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(function () {
      notification.style.display = "none";
    }, 2000);
  }
});
