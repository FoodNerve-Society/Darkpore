import { prisma } from './lib/db/client';

async function stressTest() {
  console.log("Starting Prisma Stress Test for Job Categories...");
  
  try {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("No user found in DB to attach job to!");

    // 1. Create a mock external organization with challenges
    const org = await prisma.organization.create({
      data: {
        name: "Test Org For Careers",
        country: "Nigeria",
        state: "Lagos",
        isExternal: true,
        rank: 1,
        slug: `test-org-for-careers-${Date.now()}`,
        challenges: JSON.stringify(["food-security", "agri-tech"]),
        subcategories: JSON.stringify(["precision-farming"])
      }
    });
    console.log("Created Organization:", org.id);

    // 2. Create a mock trade listing (Job)
    const job = await prisma.tradeListing.create({
      data: {
        category: "jobs",
        title: "Senior Agronomist (Test)",
        description: "A test job with categories wired.",
        priceOrAsk: "NGN 500k - 1M",
        location: "Lagos, Nigeria",
        lga: "Ikeja",
        postedById: user.id,
        organizationId: org.id,
        nervePointsCost: 0,
        status: "active",
        challenges: JSON.stringify(["climate-resilience"]),
        subcategories: JSON.stringify(["drought-resistant-crops"])
      }
    });
    console.log("Created Job Listing:", job.id);

    // 3. Fetch and verify
    const fetchedJob = await prisma.tradeListing.findUnique({
      where: { id: job.id },
      include: { organization: true }
    });

    if (!fetchedJob) throw new Error("Job not found!");

    console.log("\n--- STRESS TEST RESULTS ---");
    console.log("Job Challenges Array:", JSON.parse(fetchedJob.challenges || '[]'));
    console.log("Job Subcats Array:", JSON.parse(fetchedJob.subcategories || '[]'));
    console.log("Org Challenges Array:", fetchedJob.organization?.challenges ? JSON.parse(fetchedJob.organization.challenges) : []);
    console.log("Org Subcats Array:", fetchedJob.organization?.subcategories ? JSON.parse(fetchedJob.organization.subcategories) : []);
    console.log("SUCCESS: Multi-category JSON fields are persisting perfectly!");

    // Clean up
    await prisma.tradeListing.delete({ where: { id: job.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    console.log("Cleaned up test data.");

  } catch (error) {
    console.error("Stress Test Failed:", error);
  } finally {
    // await prisma.$disconnect();
  }
}

stressTest();
