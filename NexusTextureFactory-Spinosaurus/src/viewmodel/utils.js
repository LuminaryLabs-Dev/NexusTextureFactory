const VMUtils = {
    runWorkerPool: async (totalJobs, maxWorkers, jobFn) => {
        let cursor = 0;
        const workerCount = Math.min(maxWorkers, totalJobs);
        const workers = Array.from({ length: workerCount }, (_, slot) => (async () => {
            while (true) {
                const jobIndex = cursor++;
                if (jobIndex >= totalJobs) break;
                await jobFn(jobIndex, slot);
            }
        })());
        await Promise.all(workers);
    },
    triggerBlobDownload: (blob, filename) => {
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.download = filename;
        link.href = objectUrl;
        link.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
    }
};
