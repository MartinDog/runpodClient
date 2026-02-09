const fetch = require("node-fetch");
require("dotenv").config();
const RUNPOD_API_URL = "https://api.runpod.io/graphql";

function getApiKey() {
  return process.env.RUNPOD_API_KEY;
}

async function gqlRequest(query, variables = {}) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("RunPod API key not configured");
  }

  const res = await fetch(`${RUNPOD_API_URL}?api_key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) {
    const msg = json.errors.map((e) => e.message).join(", ");
    throw new Error(msg);
  }
  return json.data;
}
async function getTemplates() {
  const data = await gqlRequest(`
    query {
      myself {
        podTemplates {
          id
          imageName
          name
        }
      }
    }
    `);
  return data.myself.podTemplates;
}
async function getPods() {
  const data = await gqlRequest(`
    query {
      myself {
        pods {
          id
          name
          desiredStatus
          imageName
          gpuCount
          costPerHr
          containerDiskInGb
          volumeInGb
          memoryInGb
          vcpuCount
          runtime {
            uptimeInSeconds
            gpus {
              id
              gpuUtilPercent
              memoryUtilPercent
            }
            ports {
              ip
              isIpPublic
              privatePort
              publicPort
              type
            }
          }
          machine {
            gpuType {
              displayName
            }
          }
        }
        templates {
          id
          imageName
        }
      }
    }
  `);
  const pods = data.myself.pods.map((pod) => ({
    ...pod,
    gpuDisplayName: pod.machine?.gpuType?.displayName || "N/A",
  }));
  return pods;
}

async function stopPod(podId) {
  const data = await gqlRequest(
    `
    mutation stopPod($input: PodStopInput!) {
      podStop(input: $input) {
        id
        desiredStatus
      }
    }
  `,
    { input: { podId } },
  );
  return data.podStop;
}

async function startPod(podId) {
  const data = await gqlRequest(
    `
    mutation resumePod($input: PodResumeInput!) {
      podResume(input: $input) {
        id
        desiredStatus
        costPerHr
      }
    }
  `,
    { input: { podId } },
  );
  return data.podResume;
}

async function restartPod(podId) {
  await stopPod(podId);
  // Wait briefly for stop to process
  await new Promise((r) => setTimeout(r, 2000));
  return startPod(podId);
}

async function terminatePod(podId) {
  const data = await gqlRequest(
    `
    mutation terminatePod($input: PodTerminateInput!) {
      podTerminate(input: $input)
    }
  `,
    { input: { podId } },
  );
  return data.podTerminate;
}

async function createPod({
  name,
  imageName,
  gpuTypeId,
  gpuCount,
  volumeInGb,
  containerDiskInGb,
}) {
  const data = await gqlRequest(
    `
    mutation createPod($input: PodFindAndDeployOnDemandInput!) {
      podFindAndDeployOnDemand(input: $input) {
        id
        name
        desiredStatus
        costPerHr
        imageName
      }
    }
  `,
    {
      input: {
        name,
        imageName,
        gpuTypeId,
        gpuCount: gpuCount || 1,
        volumeInGb: volumeInGb || 50,
        containerDiskInGb: containerDiskInGb || 20,
        cloudType: "ALL",
      },
    },
  );
  return data.podFindAndDeployOnDemand;
}

async function getGpuTypes() {
  const data = await gqlRequest(`
    query {
      gpuTypes {
        id
        displayName
        memoryInGb
        securePrice
        communityPrice
        lowestPrice(input: { gpuCount: 1 }) {
          minimumBidPrice
          uninterruptablePrice
        }
      }
    }
  `);
  return data.gpuTypes;
}

async function testConnection() {
  const data = await gqlRequest(`query { myself { id } }`);
  return !!data.myself.id;
}

module.exports = {
  getPods,
  stopPod,
  startPod,
  restartPod,
  terminatePod,
  createPod,
  getGpuTypes,
  testConnection,
  getTemplates,
};
