export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
};

export const sidebarVariants = {
  closed: { x: '-100%', transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
  open: { x: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const chartBar = (index) => ({
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    originX: 0,
    transition: { delay: index * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
});

export const chartPie = (index) => ({
  hidden: { endAngle: 0 },
  visible: {
    endAngle: 360,
    transition: { delay: index * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
});

export const pulse = {
  animate: { scale: [1, 1.02, 1], opacity: [1, 0.7, 1] },
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

export const shimmer = {
  hidden: { x: '-100%' },
  visible: { x: '100%', transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } },
};

export const buttonPress = {
  whileTap: { scale: 0.98 },
};

export const buttonHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.15 } },
};

export const inputFocus = {
  focus: { borderColor: '#4338ca', boxShadow: '0 0 0 3px rgba(67, 56, 202, 0.15)' },
};

export const rowHover = {
  whileHover: { backgroundColor: '#faf9f7', transition: { duration: 0.12 } },
};

export const tooltip = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } },
};