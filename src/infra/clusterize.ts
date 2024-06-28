import cluster from 'node:cluster';
import * as process from 'node:process';

const clustersCount = process.env.CLUSTERS ? parseInt(process.env.CLUSTERS) : 4;

console.log(`Clustering configure with ${clustersCount} clusters... 🚀`);

export class ClusterService {
  static clusterize(callback: () => Promise<void>): void {
    if (cluster.isPrimary) {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING 🚀`);

      for (let i = 0; i < clustersCount; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
      });
    } else {
      console.log(`WORKER SERVER (${process.pid}) IS RUNNING 🚀`);
      callback();
    }
  }
}
