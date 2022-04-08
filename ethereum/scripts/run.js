const main = async () => {
  const contractFactory = await hre.ethers.getContractFactory("Hip");
  const contract =
    await contractFactory.deploy(/*{value: hre.ethers.utils.parseEther("0.001"),}*/);
  await contract.deployed();
  console.log("Contract Address:", contract.address);
  let txn = await contract.rec(
    "CHYL",
    "Mercy (CHYL Flip)",
    '<iframe width="560" height="315" src="https://www.youtube.com/embed/cc7q_ff5Sto" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
  );
  await txn.wait();
  txn = await contract.getRecs();
  console.log("Recs:", txn);
};

const run = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
