import type { ChatInteraction, NavInteraction, NavState, Interaction } from "@/shared/types/interactions"
import type { ProfileInteractionApi } from "@/preload/interactions"
import { faker } from '@faker-js/faker'

type InteractionNode =
  | (Omit<ChatInteraction, "contextId"> & { children?: InteractionNode[] })
  | (Omit<NavInteraction, "contextId"> & { children?: InteractionNode[] });

const interactionsFromNodes = (nodes: InteractionNode[]): Interaction[] => {
  const result: Interaction[] = []
  const addTree = ({ children, ...interaction }: InteractionNode, contextId: number | null) => {
    result.push({ ...interaction, contextId } as Interaction)
    children?.forEach(child => addTree(child, interaction.id))
  }
  for (const node of nodes) {
    addTree(node, null)
  }
  return result
}

export const mockInteractionApi = (
  interactionNodes: InteractionNode[]
): ProfileInteractionApi & { maxCreatedAt: number; maxUpdatedAt: number } => {
  const interactions = interactionsFromNodes(interactionNodes);
  const interactionMap = new Map(
    interactions.map((interaction) => [interaction.id, interaction])
  );
  const maxCreatedAt = Math.max(
    ...interactions.map((interaction) => interaction.createdAt)
  );
  const maxUpdatedAt = Math.max(
    ...interactions.map((interaction) => interaction.updatedAt)
  );

  return {
    profileId: () => '00000000-0000-0000-0000-000000000000',

    createChat: (chat) => Promise.resolve(chat as ChatInteraction),

    createNav: (nav) => Promise.resolve(nav as NavInteraction),

    getInteraction: (id) => {
      const interaction = interactionMap.get(id);
      if (!interaction) return Promise.resolve(null);
      const { userContent, createdAt, contextId, type } = interaction;
      return Promise.resolve({ id, userContent, createdAt, contextId, type });
    },

    getChatState: (id) => {
      const interaction = interactionMap.get(id) as ChatInteraction;
      if (!interaction || interaction.type !== "chat")
        return Promise.resolve(null);
      const { assistantContent, updatedAt, model } = interaction;
      return Promise.resolve({ assistantContent, updatedAt, model });
    },

    getNavState: (id) => {
      const interaction = interactionMap.get(id) as NavInteraction;
      if (!interaction || interaction.type !== "nav")
        return Promise.resolve(null);
      const { title, description, favIconUrl, imageAssetId, updatedAt } =
        interaction;
      return Promise.resolve({
        title,
        description,
        favIconUrl,
        imageAssetId,
        updatedAt,
      });
    },

    getChats: async ({ contextId, created, updated, limit, model, order }) =>
      interactions
        .filter(
          (interaction) =>
            interaction.type === "chat" &&
            (contextId === undefined || interaction.contextId === contextId) &&
            (created?.before === undefined ||
              interaction.createdAt < created.before) &&
            (created?.after === undefined ||
              interaction.createdAt > created.after) &&
            (updated?.before === undefined ||
              interaction.updatedAt < updated.before) &&
            (updated?.after === undefined ||
              interaction.updatedAt > updated.after) &&
            (model === undefined ||
              (interaction as ChatInteraction).model === model)
        )
        .sort((a, b) =>
          order === "asc"
            ? a.createdAt - b.createdAt
            : b.createdAt - a.createdAt
        )
        .slice(0, limit) as ChatInteraction[],

    getChatIds: async ({ contextId, created, updated, limit, model, order }) =>
      interactions
        .filter(
          (interaction) =>
              interaction.type === "chat" &&
              (contextId === undefined ||
                interaction.contextId === contextId) &&
              (created?.before === undefined ||
                interaction.createdAt < created.before) &&
              (created?.after === undefined ||
                interaction.createdAt > created.after) &&
              (updated?.before === undefined ||
                interaction.updatedAt < updated.before) &&
              (updated?.after === undefined ||
                interaction.updatedAt > updated.after) &&
              (model === undefined ||
                (interaction as ChatInteraction).model === model)
          )
          .sort((a, b) =>
            order === "asc"
              ? a.createdAt - b.createdAt
              : b.createdAt - a.createdAt
        )
        .slice(limit)
        .map((interaction) => interaction.id),

    getNavsByUrl: (url: string) => {
      return Promise.resolve(
        interactions.filter(
          (interaction) =>
            interaction.type === "nav" && interaction.userContent === url
        ) as NavInteraction[]
      );
    },

    getNavIdsByUrl: (url: string) => {
      return Promise.resolve(
        interactions
          .filter(
            (interaction) =>
              interaction.type === "nav" && interaction.userContent === url
          )
          .map((interaction) => interaction.id)
      );
    },

    getNavs: async ({ contextId, created, updated, limit, order }) => {
      return interactions
        .filter(
          interaction => interaction.type === 'nav' &&
          (contextId === undefined || interaction.contextId === contextId) &&
          (created?.before === undefined || interaction.createdAt < created.before) &&
          (created?.after === undefined || interaction.createdAt > created.after) &&
          (updated?.before === undefined || interaction.updatedAt < updated.before) &&
          (updated?.after === undefined || interaction.updatedAt > updated.after)
        )
        .sort((a, b) =>
          order === "asc"
            ? a.createdAt - b.createdAt
            : b.createdAt - a.createdAt
        )
        .slice(0, limit) as NavInteraction[];
    },

    appendAssistantContent: async (
      id: number,
      content: string,
      timestamp: number
    ) => {
      const interaction = interactionMap.get(id) as ChatInteraction;
      if (interaction && interaction.type === "chat") {
        interaction.assistantContent += content;
        interaction.updatedAt = timestamp;
        return true;
      }
      return false;
    },

    updateNavState: async (id: number, state: Partial<NavState>) => {
      const interaction = interactionMap.get(id) as NavInteraction;
      if (interaction && interaction.type === "nav") {
        Object.assign(interaction, state);
        return true;
      }
      return false;
    },
    maxCreatedAt,
    maxUpdatedAt,
  };
};

export type SkeletonNode = {
  id: number;
  type: "chat" | "nav";
  children?: SkeletonNode[];
};

export const buildMockNodes = (
  skeletons: SkeletonNode[]
): InteractionNode[] => {
  let time = 1740281770000;
  faker.seed(time);

  const mapSkeleton = (skeleton: SkeletonNode): InteractionNode => {
    const timestamp = (time += faker.number.int({ min: 1, max: 1000 }));
    const node: InteractionNode =
      skeleton.type === "chat"
        ? {
            id: skeleton.id,
            type: "chat",
            userContent: faker.lorem.sentence(),
            createdAt: timestamp,
            model: faker.helpers.arrayElement([
              "gpt-4o",
              "gpt-4o-mini",
              "deepseek-chat",
              "deepseek-reasoner",
            ]),
            assistantContent: faker.lorem.paragraph(),
            updatedAt: timestamp + faker.number.int({ min: 1, max: 10000 }),
          }
        : {
            id: skeleton.id,
            type: "nav",
            userContent: faker.internet.url(),
            createdAt: timestamp,
            updatedAt: timestamp + faker.number.int({ min: 1, max: 10000 }),
            title: faker.lorem.sentence(),
            description: faker.lorem.sentence(),
            favIconUrl: faker.image.url(),
            imageAssetId: faker.string.uuid(),
          };
    if (skeleton.children) {
      node.children = skeleton.children.map(mapSkeleton);
    }
    return node;
  };
  return skeletons.map(mapSkeleton);
};
