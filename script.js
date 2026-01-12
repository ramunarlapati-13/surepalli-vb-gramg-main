// Minimal JS for additional interactions

document.addEventListener('DOMContentLoaded', () => {
    // Add staggered animation delay to cards on load
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
    });

    // Ripple Effect Logic (Optional Enhancement for 'liquid' card)
    const liquidCard = document.querySelector('.liquid');
    if (liquidCard) {
        liquidCard.addEventListener('mousemove', function (e) {
            const rect = liquidCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // We could use this to position a radial gradient or canvas effect
            // For now, simpler CSS hover is robust, but let's add a subtle tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 5; // Max 5deg
            const rotateY = ((x - centerX) / centerX) * 5;

            liquidCard.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        liquidCard.addEventListener('mouseleave', () => {
            liquidCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }
});

// Add dynamic keyframes for fade in
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(styleSheet);
