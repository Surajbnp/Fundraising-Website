"use client";

import Image from "next/image";
import styles from "./page.module.css";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import SimpleCarousel from "./components/Carousel";

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [copied, setCopied] = useState(false);

  const upiId = "7004783929@ibl";
  const name = "Sarika Sahu";
  const note = "Donation for cancer treatment";

  const handleDonateClick = () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        name,
      )}&cu=INR&tn=${encodeURIComponent(note)}`;

      window.location.href = upiUrl;
    } else {
      onOpen();
    }
  };

  const handleMilaap = () => {
    window.open(
      "https://milaap.org/fundraisers/support-sarika-31?utm_source=whatsapp&utm_medium=fundraisers-title&mlp_referrer_id=2884627&user=new",
      "_blank",
    );
  };

  return (
    <div className={styles.page}>
      {/* HERO IMAGE */}
      {/* <Box
        minH={{ base: "32vh", md: "45vh" }}
        bgImage="https://res.cloudinary.com/dddnxiqpq/image/upload/v1770967633/1_oqskbh.png"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        backgroundPosition="center"
        borderRadius={{ base: "14px", md: "22px" }}
        mx={{ base: 3, md: 6 }}
        mt={{ base: 3, md: 6 }}
        border={"1px solid #c9c9c9"}
      /> */}

      <SimpleCarousel />

      {/* CARD */}
      <Box
      pos={'relative'}
        p={{ base: 4, md: 8 }}
        bg="white"
        w={{ base: "94%", md: "92%", lg: "70%" }}
        m="auto"
        mt={{ base: -6, md: -10 }}
        borderRadius={{ base: "16px", md: "22px" }}
        minH="40vh"
        boxShadow="rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px"
      >
        {/* HEADER */}
        <VStack align="start" spacing={4}>
          <Flex gap={4} align="center">
            <Box
              w={{ base: "44px", md: "60px" }}
              h={{ base: "44px", md: "60px" }}
              borderRadius="50%"
              bgImage="https://res.cloudinary.com/dddnxiqpq/image/upload/v1770964663/d1a55dbd-a1db-498e-ab39-fa5c5a1d31ee.webp"
              bgSize="cover"
              bgPos="center"
              flexShrink={0}
            />
            <Box>
              <Text
                fontWeight={600}
                textTransform="uppercase"
                fontSize={{ base: "22px", md: "34px" }}
              >
                Help Sarika
              </Text>
              <Text
                fontWeight={400}
                color="gray.600"
                fontSize={{ base: "14px", md: "16px" }}
              >
                From Ranchi, Jharkhand
              </Text>
            </Box>
          </Flex>
        </VStack>

        {/* CONTENT */}
        <VStack mt={{ base: 5, md: 8 }} align="start" spacing={3}>
          <Text fontWeight={500} fontSize={{ base: "18px", md: "24px" }}>
            Help Me Continue My Cancer Treatment & Recovery
          </Text>

          <Text
            maxW="700px"
            fontWeight={400}
            fontSize={{ base: "14px", md: "18px" }}
            color="gray.700"
          >
            Sarika Sahu is battling last-stage cancer. Your contribution will
            help with treatment, medicines, and care. Even a small amount brings
            hope and relief to her family.
          </Text>
        </VStack>

        {/* CTA BUTTONS */}
        <Flex
          mt={10}
          gap={4}
          direction={{ base: "row", md: "row" }}
          w="full"
        >
          <Button
            size="lg"
            w={{ base: "100%", md: "fit-content" }}
            colorScheme="pink"
            borderRadius="full"
            px={8}
            fontWeight={400}
            onClick={handleDonateClick}
          >
            Donate Now
          </Button>

          <Button
            size="lg"
            w={{ base: "100%", md: "fit-content" }}
            variant="outline"
            colorScheme="pink"
            borderRadius="full"
            px={8}
            fontWeight={400}
            onClick={handleMilaap}
          >
            Donate on Milaap
          </Button>
        </Flex>

        {/* PAYMENT SECTION */}
        <Box
          mt={12}
          p={{ base: 4, md: 6 }}
          borderRadius="2xl"
          bg="gray.50"
          border="1px dashed gray"
        >
          <Flex
            gap={6}
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between"
          >
            {/* QR */}
            <Box textAlign="center">
              <Box
                w={{ base: "180px", md: "220px" }}
                h={{ base: "180px", md: "220px" }}
                bg="white"
                borderRadius="xl"
                boxShadow="md"
                p={3}
              >
                <Box
                  w="100%"
                  h="100%"
                  bgImage="https://res.cloudinary.com/dddnxiqpq/image/upload/v1770967038/Screenshot_2026-02-03_195003_rlnlkg.webp"
                  bgSize="contain"
                  bgPos="center"
                  bgRepeat="no-repeat"
                />
              </Box>
              <Text mt={2} fontSize="sm" color="gray.600">
                Scan to Pay
              </Text>
            </Box>

            {/* UPI DETAILS */}
            <VStack align="start" spacing={3} w="full" maxW="360px">
              <Text fontWeight={600} fontSize="lg">
                UPI ID
              </Text>

              <Flex
                w="full"
                p={3}
                bg="white"
                borderRadius="lg"
                align="center"
                justify="space-between"
                boxShadow="sm"
              >
                <Text fontSize="sm">{upiId}</Text>
                <Button
                  size="sm"
                  leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
                  colorScheme={copied ? "green" : "gray"}
                  onClick={() => {
                    navigator.clipboard.writeText(upiId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </Flex>

              <Text fontSize="sm" color="gray.500">
                You can pay directly using any UPI app
              </Text>

              <Button
                leftIcon={<FaWhatsapp />}
                colorScheme="green"
                borderRadius={"22px"}
                w="full"
                onClick={() => {
                  const msg = encodeURIComponent(
                    "Please help Sarika fight cancer. Donate here: https://your-site.vercel.app",
                  );
                  window.open(`https://wa.me/?text=${msg}`, "_blank");
                }}
              >
                Share on WhatsApp
              </Button>
            </VStack>
          </Flex>
        </Box>

        {/* DESKTOP MODAL */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
          <ModalOverlay />
          <ModalContent borderRadius="2xl">
            <ModalHeader>Scan & Pay</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <Box
                  w="220px"
                  h="220px"
                  bg="white"
                  borderRadius="xl"
                  boxShadow="md"
                  p={3}
                >
                  <Box
                    w="100%"
                    h="100%"
                    bgImage="https://res.cloudinary.com/dddnxiqpq/image/upload/v1770967038/Screenshot_2026-02-03_195003_rlnlkg.webp"
                    bgSize="contain"
                    bgPos="center"
                    bgRepeat="no-repeat"
                  />
                </Box>

                <Flex
                  w="full"
                  p={3}
                  bg="gray.50"
                  borderRadius="lg"
                  align="center"
                  justify="space-between"
                >
                  <Text fontSize="sm" fontWeight={500}>
                    {upiId}
                  </Text>
                  <Button
                    size="sm"
                    leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
                    colorScheme={copied ? "green" : "gray"}
                    onClick={() => {
                      navigator.clipboard.writeText(upiId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </Flex>

                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Scan with GPay, PhonePe, Paytm or any UPI app
                </Text>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </div>
  );
}
