import React, { useEffect, useState } from "react";
import { sha256 } from "js-sha256";
import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const toast = useToast();

  useEffect(() => {
    getData();
  }, []);

  // Fetches the data from the server and stores it locally
  const getData = async () => {
    console.log("Fetching data from server...");
    const response = await fetch(API_URL);
    const { data, hash } = await response.json();
    console.log("Data received from server:", data);
    setData(data);
    setHash(hash);
  };

  // Updates the data on the server and stores the hash locally
  const updateData = async () => {
    console.log("Updating data on server...");
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Compute and store hash locally
    const computedHash = sha256(data);
    localStorage.setItem("dataHash", computedHash);
    console.log("Computed hash stored locally:", computedHash);

    await getData();

    toast({
      title: "Data Updated",
      description: "Your data has been updated on the server.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Verifies the integrity of the data by comparing the stored hash with the computed hash
  const verifyData = () => {
    console.log("Verifying data integrity...");
    const storedHash = localStorage.getItem("dataHash");
    const computedHash = sha256(data);
    console.log("Stored hash:", storedHash);
    console.log("Computed hash of current data:", computedHash);

    if (computedHash === storedHash) {
      toast({
        title: "Data Verified",
        description: "Data is intact.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Data Tampering Detected",
        description: "Data has been tampered with!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Recovers the previous data from the server
  const recoverData = async () => {
    console.log("Recovering previous data from server...");
    const response = await fetch(`${API_URL}/history`);
    const history = await response.json();
    const lastEntry = history[history.length - 2]; // Get the previous entry
    if (lastEntry) {
      setData(lastEntry.data);
      setHash(lastEntry.hash);
      toast({
        title: "Data Recovered",
        description: "Previous data has been restored.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      console.log("Recovered data:", lastEntry.data);
    } else {
      toast({
        title: "No Data to Recover",
        description: "No previous data found in history.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      console.log("No previous data found in history.");
    }
  };

  // Simulates unauthorized data alteration by changing the data without updating the stored hash
  const simulateTampering = () => {
    console.log("Simulating data tampering...");
    setData("Tampered Data");
    toast({
      title: "Data Tampered",
      description: "Data has been altered without updating the hash.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  };

  // Resets the data to its initial state and removes the stored hash
  const resetData = () => {
    console.log("Resetting data to initial state...");
    setData("");
    localStorage.removeItem("dataHash");
    toast({
      title: "Data Reset",
      description: "Data and stored hash have been cleared.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Flex
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
    >
      <Box
        bg="white"
        p={8}
        rounded="md"
        shadow="md"
        maxWidth="500px"
        width="100%"
      >
        <Stack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Tamper Proof Data
          </Text>
          <Input
            placeholder="Enter your data here..."
            size="lg"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <Stack spacing={4} direction={{ base: "column", md: "row" }}>
            <Button colorScheme="blue" onClick={updateData} flex="1">
              Update Data
            </Button>
            <Button colorScheme="green" onClick={verifyData} flex="1">
              Verify Data
            </Button>
          </Stack>
          <Stack spacing={4} direction={{ base: "column", md: "row" }}>
            <Button colorScheme="orange" onClick={recoverData} flex="1">
              Recover Data
            </Button>
            <Button colorScheme="red" onClick={simulateTampering} flex="1">
              Simulate Tampering
            </Button>
          </Stack>
          <Button variant="outline" onClick={resetData}>
            Reset Data
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}

export default App;
