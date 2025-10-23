import { Box } from '@chakra-ui/react';

const LoomaLogo = ({ size = 32 }) => {
  return (
    <Box
      as="svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="loomaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4299E1" />
          <stop offset="100%" stopColor="#3182CE" />
        </linearGradient>
        <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#48BB78" />
          <stop offset="100%" stopColor="#38A169" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="47" fill="url(#loomaGradient)" />

      {/* Book icon - representing learning */}
      <g transform="translate(50, 50)">
        {/* Left page */}
        <path
          d="M -20 -15 L -20 20 L 0 15 L 0 -20 Z"
          fill="white"
          opacity="0.95"
        />
        {/* Right page */}
        <path
          d="M 0 -20 L 0 15 L 20 20 L 20 -15 Z"
          fill="#E2E8F0"
          opacity="0.9"
        />
        {/* Book spine */}
        <rect x="-1.5" y="-20" width="3" height="35" fill="#2C5282" rx="0.5"/>
      </g>

      {/* Chat bubble - representing discussion */}
      <circle cx="72" cy="30" r="14" fill="url(#chatGradient)" opacity="0.95"/>
      <path d="M 66 36 L 66 40 L 70 37 Z" fill="url(#chatGradient)" opacity="0.95"/>

      {/* Chat lines inside bubble */}
      <line x1="65" y1="26" x2="79" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="65" y1="30" x2="76" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="65" y1="34" x2="78" y2="34" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Decorative collaboration dots */}
      <circle cx="28" cy="70" r="2.5" fill="#F6AD55" opacity="0.8"/>
      <circle cx="35" cy="75" r="2" fill="#F6AD55" opacity="0.7"/>
      <circle cx="42" cy="78" r="1.5" fill="#F6AD55" opacity="0.6"/>
    </Box>
  );
};

export default LoomaLogo;
