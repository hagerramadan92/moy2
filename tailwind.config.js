// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-20px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)' 
          },
        },
      },
    },
     keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        }
      }
  },
}