const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

export async function uploadFileToIPFS(file: File): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.warn("Pinata API keys are missing. Using mock IPFS hash.");
    // In development without keys, return a mock hash
    return `QmMockHash${Date.now()}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: `SkillProof_submission_${Date.now()}`,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    if (!res.ok) {
        throw new Error(`Error uploading file to IPFS: ${res.statusText}`);
    }

    const resData = await res.json();
    return resData.IpfsHash;
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw error;
  }
}

export async function uploadJSONToIPFS(jsonBody: object): Promise<string> {
   if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.warn("Pinata API keys are missing. Using mock IPFS hash.");
    return `QmMockJSONHash${Date.now()}`;
  }

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: JSON.stringify({
        pinataContent: jsonBody,
        pinataMetadata: {
          name: `SkillProof_metadata_${Date.now()}`
        }
      }),
    });

    if (!res.ok) {
        throw new Error(`Error uploading JSON to IPFS: ${res.statusText}`);
    }

    const resData = await res.json();
    return resData.IpfsHash;
  } catch (error) {
    console.error("IPFS JSON Upload Error:", error);
    throw error;
  }
}
