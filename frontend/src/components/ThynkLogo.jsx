import { Box } from '@chakra-ui/react';

const ThynkLogo = ({ size = 32, color = '#4299E1' }) => {
  return (
    <Box
      as="svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="thynkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4299E1" />
          <stop offset="100%" stopColor="#3182CE" />
        </linearGradient>
        <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#63B3ED" />
          <stop offset="100%" stopColor="#4299E1" />
        </linearGradient>
      </defs>

      {/* Main circle background */}
      <circle cx="50" cy="50" r="48" fill="url(#thynkGradient)" />

      {/* Brain/Think icon - stylized "T" with brain pattern */}
      <g transform="translate(50, 50)">
        {/* Stylized "T" letter */}
        <path
          d="M -20 -25 L 20 -25 L 20 -15 L 5 -15 L 5 25 L -5 25 L -5 -15 L -20 -15 Z"
          fill="white"
          opacity="0.95"
        />

        {/* Brain neurons/connections - decorative elements */}
        <circle cx="-15" cy="-5" r="2" fill="white" opacity="0.6" />
        <circle cx="15" cy="-5" r="2" fill="white" opacity="0.6" />
        <circle cx="-12" cy="10" r="1.5" fill="white" opacity="0.5" />
        <circle cx="12" cy="10" r="1.5" fill="white" opacity="0.5" />

        {/* Connection lines */}
        <line x1="-15" y1="-5" x2="-8" y2="-10" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="15" y1="-5" x2="8" y2="-10" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="-12" y1="10" x2="-5" y2="15" stroke="white" strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="10" x2="5" y2="15" stroke="white" strokeWidth="0.8" opacity="0.3" />
      </g>

      {/* Accent dots for modern look */}
      <circle cx="85" cy="15" r="3" fill="white" opacity="0.7" />
      <circle cx="15" cy="85" r="2.5" fill="white" opacity="0.6" />
      <circle cx="85" cy="85" r="2" fill="white" opacity="0.5" />
    </Box>
  );
};

export default ThynkLogo;
