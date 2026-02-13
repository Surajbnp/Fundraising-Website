"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const images = [
  "https://res.cloudinary.com/dddnxiqpq/image/upload/v1770962606/SARIKA_hl1t5k.webp",
  "https://res.cloudinary.com/dddnxiqpq/image/upload/v1770967633/1_oqskbh.webp",
  "https://res.cloudinary.com/dddnxiqpq/image/upload/v1770968411/9596ddc2-3ef7-453f-99a6-0d2ad5e417e9.png"
];

export default function SimpleCarousel() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      h={{ base: "32vh", md: "45vh" }} // 👈 FIX: real height
      borderRadius={{ base: "14px", md: "22px" }}
      mx={{ base: 3, md: 6 }}
      mt={{ base: 3, md: 6 }}
      overflow="hidden"
      position="relative"
    >
      <Box
        position="absolute" // 👈 FIX: fill parent
        inset={0} // top:0 right:0 bottom:0 left:0
        bgImage={`url(${images[index]})`}
        bgRepeat="no-repeat"
        bgSize="cover"
        bgPos="center"
        transition="opacity 0.4s ease-in-out, transform 0.4s ease-in-out"
        opacity={fade ? 1 : 0}
        transform={fade ? "scale(1)" : "scale(1.02)"}
      />
    </Box>
  );
}
