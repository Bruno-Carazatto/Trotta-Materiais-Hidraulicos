// Form Validation + Máscara de Telefone
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');

    // Suporte a id="phone" ou id="telefone"
    const phoneInput = document.getElementById('phone') || document.getElementById('telefone');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Antes de validar, garante que o telefone está formatado corretamente
            if (phoneInput) {
                phoneInput.value = formatPhone(phoneInput.value);
            }

            if (validateForm()) {
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                contactForm.reset();
            }
        });

        // Real-time validation
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');

        // Listeners existentes
        if (nameInput)   nameInput.addEventListener('input',  () => validateField(nameInput));
        if (emailInput)  emailInput.addEventListener('input', () => validateField(emailInput));
        if (subjectInput)subjectInput.addEventListener('change', () => validateField(subjectInput));
        if (messageInput)messageInput.addEventListener('input', () => validateField(messageInput));

        // Máscara e validação em tempo real do telefone
        if (phoneInput) {
            phoneInput.addEventListener('input', () => {
                const pos = getCursorPosition(phoneInput);
                const prevLength = phoneInput.value.length;

                phoneInput.value = formatPhone(phoneInput.value);
                validateField(phoneInput);

                // tentativa simples de manter o cursor estável
                const diff = phoneInput.value.length - prevLength;
                setCursorPosition(phoneInput, Math.max(pos + diff, 0));
            });

            // Impede colar caracteres inválidos
            phoneInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const onlyDigits = (text || '').replace(/\D/g, '').slice(0, 11);
                phoneInput.value = formatPhone(onlyDigits);
                validateField(phoneInput);
            });

            // Teclas: permite apenas números, backspace, delete, setas, tab
            phoneInput.addEventListener('keydown', (e) => {
                const allowedKeys = [
                    'Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'
                ];
                if (allowedKeys.includes(e.key)) return;
                if (!/\d/.test(e.key)) e.preventDefault();
            });
        }
    }
});

function validateForm() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const phoneInput = document.getElementById('phone') || document.getElementById('telefone');

    let isValid = true;

    if (nameInput && !validateField(nameInput)) isValid = false;
    if (emailInput && !validateField(emailInput)) isValid = false;
    if (subjectInput && !validateField(subjectInput)) isValid = false;
    if (messageInput && !validateField(messageInput)) isValid = false;
    if (phoneInput && !validateField(phoneInput)) isValid = false;

    return isValid;
}

function validateField(field) {
    const errorElement = field.nextElementSibling;

    // NOME
    if (field.id === 'name') {
        if (field.value.trim() === '') {
            showError(field, errorElement, 'Por favor, insira seu nome');
            return false;
        } else if (field.value.trim().length < 3) {
            showError(field, errorElement, 'O nome deve ter pelo menos 3 caracteres');
            return false;
        } else {
            clearError(field, errorElement);
            return true;
        }
    }

    // EMAIL
    if (field.id === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (field.value.trim() === '') {
            showError(field, errorElement, 'Por favor, insira seu email');
            return false;
        } else if (!emailRegex.test(field.value)) {
            showError(field, errorElement, 'Por favor, insira um email válido');
            return false;
        } else {
            clearError(field, errorElement);
            return true;
        }
    }

    // ASSUNTO
    if (field.id === 'subject') {
        if (field.value === '' || field.value === null) {
            showError(field, errorElement, 'Por favor, selecione um assunto');
            return false;
        } else {
            clearError(field, errorElement);
            return true;
        }
    }

    // MENSAGEM
    if (field.id === 'message') {
        if (field.value.trim() === '') {
            showError(field, errorElement, 'Por favor, insira sua mensagem');
            return false;
        } else if (field.value.trim().length < 10) {
            showError(field, errorElement, 'A mensagem deve ter pelo menos 10 caracteres');
            return false;
        } else {
            clearError(field, errorElement);
            return true;
        }
    }

    // TELEFONE (suporta id="phone" ou id="telefone")
    if (field.id === 'phone' || field.id === 'telefone') {
        const digits = field.value.replace(/\D/g, '');
        if (digits.length === 0) {
            showError(field, errorElement, 'Por favor, insira seu telefone');
            return false;
        }
        if (digits.length < 10 || digits.length > 11) {
            showError(field, errorElement, 'Telefone deve ter 10 ou 11 dígitos');
            return false;
        }
        // Pode adicionar validações de DDD, etc., se quiser
        clearError(field, errorElement);
        return true;
    }
}

function showError(field, errorElement, message) {
    field.style.borderColor = '#e30613';
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(field, errorElement) {
    field.style.borderColor = '#ddd';
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

/* ===== Utilitários da máscara ===== */

// Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
function formatPhone(value) {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1');
    if (digits.length <= 6) return digits.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    if (digits.length <= 10) {
        // Fixo: (11) 2345-6789
        return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    // Celular: (11) 91234-5678
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

// Posição do cursor (para não “pular” ao mascarar)
function getCursorPosition(input) {
    try {
        return input.selectionStart || 0;
    } catch { return 0; }
}
function setCursorPosition(input, pos) {
    try {
        input.setSelectionRange(pos, pos);
    } catch {}
}
