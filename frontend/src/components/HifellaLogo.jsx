import { Image } from '@chakra-ui/react';

const HifellaLogo = ({ size = 32 }) => {
  return (
    <Image
      src="/hifella-logo.jpg"
      alt="HiFella Logo"
      width={size}
      height={size}
      borderRadius="lg"
      objectFit="cover"
      bg="gray.50"
      p={1}
    />
  );
};

export default HifellaLogo;
