/**
 * Minimal dependency-graph workflow engine.
 * A node is { id, dependsOn: string[], compute(upstreamValues) => value }.
 */

/**
 * Order nodes so every node runs after its dependencies.
 * @throws {Error} On unknown dependencies, duplicate ids or circular dependencies.
 */
export function topologicalOrder(nodes) {
  const byId = new Map();
  for (const node of nodes) {
    if (byId.has(node.id)) throw new Error(`Duplicate workflow node "${node.id}"`);
    byId.set(node.id, node);
  }
  const ordered = [];
  const state = new Map(); // 1 = visiting, 2 = done
  const visit = (node, path) => {
    if (state.get(node.id) === 2) return;
    if (state.get(node.id) === 1) throw new Error(`Circular dependency: ${[...path, node.id].join(' → ')}`);
    state.set(node.id, 1);
    for (const dependencyId of node.dependsOn) {
      const dependency = byId.get(dependencyId);
      if (!dependency) throw new Error(`Node "${node.id}" depends on unknown node "${dependencyId}"`);
      visit(dependency, [...path, node.id]);
    }
    state.set(node.id, 2);
    ordered.push(node);
  };
  nodes.forEach((node) => visit(node, []));
  return ordered;
}

/**
 * Run every node in dependency order. A failing node records an error and every downstream
 * node is marked failed instead of computing from missing data.
 * @returns {Record<string, {value?: any, error?: string}>}
 */
export function runWorkflow(nodes) {
  const results = {};
  for (const node of topologicalOrder(nodes)) {
    const failedDependency = node.dependsOn.find((id) => results[id].error);
    if (failedDependency) {
      results[node.id] = { error: `Upstream step "${failedDependency}" failed` };
      continue;
    }
    try {
      const upstream = Object.fromEntries(node.dependsOn.map((id) => [id, results[id].value]));
      results[node.id] = { value: node.compute(upstream) };
    } catch (error) {
      results[node.id] = { error: error.message };
    }
  }
  return results;
}
