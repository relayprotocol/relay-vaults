import { task, subtask } from 'hardhat/config'
import { TASK_COMPILE_SOLIDITY_COMPILE_JOBS } from 'hardhat/builtin-tasks/task-names'
import './updateAddresses'

/**
 * This mdoule adds post-deployment hooks to automatically update addresses
 * after deployment tasks complete
 */

// List of deployment tasks that should trigger address updates
const DEPLOYMENT_TASKS = [
  'deploy:pool-factory',
  'deploy:bridge-factory',
  'deploy:bridge-proxy',
]

// Add post-task hooks for each deployment task
for (const deployTask of DEPLOYMENT_TASKS) {
  subtask(`${deployTask}:post`).setAction(async (_, { run }) => {
    console.log(
      `\nDeployment task "${deployTask}" completed. Updating addresses...`
    )
    await run('utils:update-addresses')
  })

  // Override each deployment task to run the post-task
  task(deployTask).setAction(async (args, hre, runSuper) => {
    // Run the original task
    const result = await runSuper(args)

    // Run the post-task
    try {
      await hre.run(`${deployTask}:post`)
    } catch (error) {
      console.warn(
        '\nWarning: Failed to update addresses after deployment:',
        error
      )
    }

    return result
  })
}
