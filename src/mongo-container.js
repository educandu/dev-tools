import { noop } from './helpers.js';
import { DEFAULT_STARTUP_GRACE_PERIOD, DockerContainer } from './docker-container.js';

const DEFAULT_MONGO_CONTAINER_NAME = 'mongo';

// Temporary solution due to ARM64 processor incompatibility
// until Bitnami will support it: https://github.com/bitnami/charts/issues/7305
const DEFAULT_MONGO_IMAGE = 'educandu/mongo:5.0.6-multiplatform.2';

export class MongoContainer extends DockerContainer {
  constructor({
    rootUser,
    rootPassword,
    replicaSetName,
    replicaSetMode = 'primary',
    advertisedHostname = 'localhost',
    port = 27017,
    name = DEFAULT_MONGO_CONTAINER_NAME,
    image = DEFAULT_MONGO_IMAGE,
    env = {},
    netHost = false,
    cmd = [],
    onFirstRun = noop,
    startupGracePeriod = DEFAULT_STARTUP_GRACE_PERIOD
  }) {
    const replicaSetEnvParams = replicaSetName
      ? {
        MONGODB_REPLICA_SET_KEY: replicaSetName,
        MONGODB_REPLICA_SET_NAME: replicaSetName,
        MONGODB_REPLICA_SET_MODE: replicaSetMode
      }
      : {};

    super({
      name,
      image,
      startupGracePeriod,
      portMappings: [`${port}:27017`],
      env: {
        MONGODB_ROOT_USER: rootUser,
        MONGODB_ROOT_PASSWORD: rootPassword,
        MONGODB_ADVERTISED_HOSTNAME: advertisedHostname,
        ...replicaSetEnvParams,
        ...env
      },
      netHost,
      cmd,
      onFirstRun
    });
  }
}
