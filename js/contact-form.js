(function () {
    'use strict';

    var RECAPTCHA_SRC = 'https://www.google.com/recaptcha/api.js';
    var recaptchaLoadPromise = null;

    function getEl(id) {
        return document.getElementById(id);
    }

    function ensureRecaptchaLoaded() {
        if (window.grecaptcha) return Promise.resolve();
        if (recaptchaLoadPromise) return recaptchaLoadPromise;

        recaptchaLoadPromise = new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src^="' + RECAPTCHA_SRC + '"]');
            if (existing) {
                existing.addEventListener('load', function () {
                    resolve();
                }, { once: true });
                existing.addEventListener('error', function () {
                    reject(new Error('reCAPTCHA failed to load'));
                }, { once: true });
                return;
            }

            var script = document.createElement('script');
            script.src = RECAPTCHA_SRC;
            script.async = true;
            script.defer = true;
            script.onload = function () {
                resolve();
            };
            script.onerror = function () {
                reject(new Error('reCAPTCHA failed to load'));
            };
            document.head.appendChild(script);
        });

        return recaptchaLoadPromise;
    }

    function encodeFormData(formData) {
        var params = new URLSearchParams();
        formData.forEach(function (value, key) {
            params.append(key, String(value));
        });
        return params.toString();
    }

    function init() {
        var form = getEl('cs-form-490');
        if (!form) return;

        var nameInput = getEl('name-490');
        var emailInput = getEl('email-490');
        var phoneInput = getEl('phone-490');
        var findInput = getEl('find-490');
        var messageInput = getEl('message-490');
        var successEl = getEl('cs-form-490-success');
        var errorEl = getEl('cs-form-490-error');

        void nameInput;
        void emailInput;
        void phoneInput;
        void findInput;
        void messageInput;

        var recaptchaKicked = false;
        function kickRecaptchaLoad() {
            if (recaptchaKicked) return;
            recaptchaKicked = true;
            ensureRecaptchaLoaded().catch(function () {
                // If it fails, we'll show a message on submit.
            });
        }

        // Start loading reCAPTCHA when the user is likely to use the form.
        form.addEventListener('focusin', kickRecaptchaLoad);
        form.addEventListener('pointerdown', kickRecaptchaLoad);
        form.addEventListener('touchstart', kickRecaptchaLoad, { passive: true });

        function hideSuccess() {
            if (!successEl) return;
            successEl.hidden = true;
            successEl.textContent = '';
        }

        function hideError() {
            if (!errorEl) return;
            errorEl.hidden = true;
            errorEl.textContent = '';
        }

        function hideStatus() {
            hideSuccess();
            hideError();
        }

        function hideErrorOnEdit() {
            // Keep success visible; clear only the error when the user starts editing.
            hideError();
        }

        // Clear errors only on clear user edit intent.
        // Password managers can fire input/change events that would otherwise
        // immediately hide the success message after submission.
        form.addEventListener('keydown', hideErrorOnEdit);
        form.addEventListener('paste', hideErrorOnEdit);

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Use native browser validation UI even though we're intercepting submission.
            if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
                return;
            }

            // If Netlify reCAPTCHA is enabled, ensure we have a token before submitting.
            // The hidden response field may not exist until the reCAPTCHA script loads.
            var recaptchaEnabled =
                form.hasAttribute('data-netlify-recaptcha') ||
                !!form.querySelector('[data-netlify-recaptcha]');

            if (recaptchaEnabled) {
                kickRecaptchaLoad();
                var recaptchaResponse = form.querySelector('[name="g-recaptcha-response"]');
                if (!recaptchaResponse || typeof recaptchaResponse.value !== 'string' || recaptchaResponse.value.trim() === '') {
                    hideStatus();
                    if (errorEl) {
                        errorEl.textContent = 'Please complete the reCAPTCHA and try again.';
                        errorEl.hidden = false;
                    }
                    return;
                }
            }

            var formData = new FormData(form);
            var postUrl = form.getAttribute('action') || window.location.pathname || '/';

            // New submit attempt: clear any previous status.
            hideStatus();

            fetch(postUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: encodeFormData(formData)
            })
                .then(function (res) {
                    if (!res.ok) throw new Error('Non-2xx response');

                    // Clear the form and show the success message.
                    form.reset();
                    try {
                        if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
                            window.grecaptcha.reset();
                        }
                    } catch (e2) {
                        // ignore
                    }
                    if (successEl) {
                        successEl.textContent = "We'll be in touch soon!";
                        successEl.hidden = false;
                    }
                })
                .catch(function () {
                    if (errorEl) {
                        errorEl.textContent = 'Something went wrong, please email us at info@bluecanarywebdesign.com';
                        errorEl.hidden = false;
                    }
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
