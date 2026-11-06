import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  ["data", "Data", "PROVIDER_CONFIG_REQUIRED"],
  ["airtime", "Airtime", "PROVIDER_CONFIG_REQUIRED"],
  ["cable", "Cable TV", "PROVIDER_CONFIG_REQUIRED"],
  ["electricity", "Electricity", "PROVIDER_CONFIG_REQUIRED"],
  ["data-card", "Data Card", "COMING_SOON"],
  ["bonus-to-wallet", "Bonus to Wallet", "COMING_SOON"],
  ["recharge-to-cash", "Recharge to Cash", "COMING_SOON"],
  ["recharge-pin", "Recharge PIN", "COMING_SOON"],
  ["education-pin", "Education PIN", "COMING_SOON"],
  ["affiliate", "Affiliate Website", "COMING_SOON"],
  ["referrals", "My Referrals", "ENABLED"],
  ["more", "More Services", "ENABLED"],
  ["cac", "CAC Services", "COMING_SOON"],
  ["nin", "NIN Services", "COMING_SOON"],
  ["bvn", "BVN Services", "COMING_SOON"],
  ["crypto", "Crypto Services", "COMING_SOON"],
];

// MTN SME reference prices supplied by the account owner. These are NEVER
// purchasable until provider plans with source=PROVIDER are synced.
const MTN_SME_PLANS = [
  ["500MB-4D", "500 MB", 512, "4–5 days", 240, 10],
  ["500MB-7D", "500 MB", 512, "7 days", 270, 20],
  ["1GB-7D", "1 GB", 1024, "7 days", 395, 30],
  ["1GB-30D-A", "1 GB", 1024, "20–30 days", 450, 40],
  ["1GB-30D-B", "1 GB", 1024, "21–30 days", 500, 50],
  ["2GB-30D", "2 GB", 2048, "21–30 days", 800, 60],
  ["3GB-30D", "3 GB", 3072, "21–30 days", 1100, 70],
  ["5GB-30D", "5 GB", 5120, "21–30 days", 1600, 80],
  ["10GB-30D", "10 GB (5 GB × 2)", 10240, "21–30 days", 3000, 90],
  ["15GB-30D", "15 GB (5 GB × 3)", 15360, "21–30 days", 4500, 100],
  ["20GB-30D", "20 GB (5 GB × 4)", 20480, "21–30 days", 6000, 110],
];

async function main() {
  for (const [key, name, status] of SERVICES) {
    await prisma.serviceAvailability.upsert({
      where: { key },
      create: { key, name, status },
      update: { name, status },
    });
  }

  for (const [slug, name, sizeMb, validity, naira, sortOrder] of MTN_SME_PLANS) {
    await prisma.dataPlan.upsert({
      where: {
        network_dataType_planCode: {
          network: "MTN",
          dataType: "SME",
          planCode: `REF-MTN-SME-${slug}`,
        },
      },
      create: {
        network: "MTN",
        dataType: "SME",
        planCode: `REF-MTN-SME-${slug}`,
        name,
        sizeMb,
        validity,
        priceKobo: naira * 100,
        costKobo: 0,
        source: "REFERENCE",
        active: true,
        sortOrder,
      },
      update: {
        name,
        sizeMb,
        validity,
        priceKobo: naira * 100,
        sortOrder,
      },
    });
  }

  await prisma.announcement.upsert({
    where: { id: "welcome" },
    create: {
      id: "welcome",
      title: "Welcome to Dpsub",
      body: "Buy data, airtime and more. Wallet funding and provider services go live once credentials are configured.",
      active: true,
    },
    update: { active: true },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
