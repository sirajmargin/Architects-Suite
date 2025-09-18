// Prisma disabled for testing
export const prisma = {
  diagram: {
    count: () => Promise.resolve(0),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve({})
  },
  user: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({})
  },
  collaborationSession: {
    groupBy: () => Promise.resolve([])
  }
};