document.addEventListener('DOMContentLoaded', function() {
            const saveBtn = document.getElementById('save-btn');
            const btnText = document.getElementById('btn-text');
            const loader = document.getElementById('loader');
            const codeTextarea = document.getElementById('code');
            const languageSelect = document.getElementById('language');
            const resultDiv = document.getElementById('result');
            const shareLink = document.getElementById('share-link');
            const copyBtn = document.getElementById('copy-btn');
            const notification = document.getElementById('notification');
            const errorDiv = document.getElementById('error');

            const API_KEY = '$2a$10$hOrcaQAGTIU.l5eETxKJt.oufAU/58xqkaMI8Hc/Mz7Obrvk8E7N2';

            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');

            if (id) {
                loadCode(id);
            } else {
                codeTextarea.focus();
            }

            saveBtn.addEventListener('click', function() {
                const code = codeTextarea.value.trim();
                const language = languageSelect.value;

                if (!code) {
                    alert('Пожалуйста, введите код для сохранения');
                    return;
                }

                // Показываем индикатор загрузки
                saveBtn.disabled = true;
                loader.style.display = 'inline-block';
                btnText.textContent = 'Сохранение...';
                errorDiv.style.display = 'none';

                fetch('https://api.jsonbin.io/v3/b', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': API_KEY,
                        'X-Bin-Name': 'Code Snippet',
                        'X-Bin-Private': 'false'
                    },
                    body: JSON.stringify({
                        code: code,
                        language: language,
                        created: new Date().toISOString()
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.metadata && data.metadata.id) {
                        const shareUrl = window.location.origin + window.location.pathname + '?id=' + data.metadata.id;
                        shareLink.textContent = shareUrl;
                        shareLink.setAttribute('data-url', shareUrl);
                        resultDiv.style.display = 'block';

                        resultDiv.scrollIntoView({ behavior: 'smooth' });

                        window.history.replaceState({}, document.title, '?id=' + data.metadata.id);
                    } else {
                        throw new Error('Не удалось сохранить код');
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    errorDiv.style.display = 'block';
                    errorDiv.textContent = 'Ошибка: ' + error.message;
                })
                .finally(() => {
                    saveBtn.disabled = false;
                    loader.style.display = 'none';
                    btnText.textContent = 'Сохранить код';
                });
            });

            copyBtn.addEventListener('click', function() {
                const url = shareLink.getAttribute('data-url');
                navigator.clipboard.writeText(url).then(function() {
                    notification.style.display = 'block';
                    setTimeout(function() {
                        notification.style.display = 'none';
                    }, 2000);
                });
            });

            function loadCode(id) {
                saveBtn.disabled = true;
                loader.style.display = 'inline-block';
                btnText.textContent = 'Загрузка...';
                fetch(`https://api.jsonbin.io/v3/b/${id}`, {
                    headers: {
                        'X-Master-Key': API_KEY
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.record && data.record.code) {
                        codeTextarea.value = data.record.code;
                        if (data.record.language) {
                            languageSelect.value = data.record.language;
                        }

                        codeTextarea.readOnly = true;
                        languageSelect.disabled = true;
                        saveBtn.style.display = 'none';

                        const shareUrl = window.location.href;
                        shareLink.textContent = shareUrl;
                        shareLink.setAttribute('data-url', shareUrl);
                        resultDiv.style.display = 'block';
                    } else {
                        codeTextarea.value = 'Код не найден. Возможно, он был удален или срок хранения истек.';
                        codeTextarea.readOnly = true;
                        saveBtn.disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    codeTextarea.value = 'Произошла ошибка при загрузке кода.';
                    codeTextarea.readOnly = true;
                    saveBtn.disabled = true;
                })
                .finally(() => {
                    loader.style.display = 'none';
                    btnText.textContent = 'Сохранить код';
                });
            }
        });
