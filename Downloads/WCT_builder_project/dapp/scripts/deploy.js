async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with account:', await deployer.getAddress())

  const Rewards = await ethers.deployContract('Rewards', [])
  await Rewards.waitForDeployment()
  console.log('Rewards deployed to:', Rewards.target)

  // Write deployed address to a file for CI to pick up
  const fs = require('fs')
  const path = require('path')
  const out = path.join(__dirname, '..', '.deploy_address')
  try {
    fs.writeFileSync(out, Rewards.target.toString(), { encoding: 'utf8' })
    console.log('Wrote deployed address to', out)
  } catch (e) {
    console.warn('Failed to write deployed address file:', e.message)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
