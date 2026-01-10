(function () {
    'use strict';

    function getEl(id) {
        return document.getElementById(id);
    }

    function encodeFormData(formData) {
        var params = new URLSearchParams();
        formData.forEach(function (value, key) {
            params.append(key, String(value));
        });
        return params.toString();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var form = getEl('cs-form-490');
        if (!form) return;

        var nameInput = getEl('name-490');
        var emailInput = getEl('email-490');
        var phoneInput = getEl('phone-490');
        var findInput = getEl('find-490');
        var messageInput = getEl('message-490');
        var successEl = getEl('cs-form-490-success');
        var errorEl = getEl('cs-form-490-error');

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

        // Hide the success message as soon as the user starts editing again.
        ['input', 'change'].forEach(function (evtName) {
            form.addEventListener(evtName, hideStatus, { passive: true });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Use native browser validation UI even though we're intercepting submission.
            if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
                return;
            }

            // If Netlify reCAPTCHA is enabled, ensure we have a token before submitting.
            var recaptchaResponse = form.querySelector('[name="g-recaptcha-response"]');
            if (recaptchaResponse && typeof recaptchaResponse.value === 'string') {
                if (recaptchaResponse.value.trim() === '') {
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
    });
})();
