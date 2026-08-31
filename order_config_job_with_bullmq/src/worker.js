import { Worker } from "bullmq";
import {connection} from './queue.js'

const worker = new Worker(
  "email",
  async (job) => {
    console.log("Processing email job...", job.id, job.name, job.data)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("Email job is completed")
  },
  {connection}
)

worker.on("completed", (job)=>{
  console.log("job completed!", job.id, job.name, job.data)
})

worker.on("failed", (job)=>{
  console.log("job failed!", job.id, job.name, job.data)
})