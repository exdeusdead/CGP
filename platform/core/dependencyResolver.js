class DependencyResolver {

    resolve(engines = []) {

        const map = new Map();

        for (const engine of engines) {

            if (map.has(engine.name)) {
                throw new Error(
                    `Duplicate engine: ${engine.name}`
                );
            }

            map.set(engine.name, engine);
        }

        const resolved = [];
        const visiting = new Set();
        const visited = new Set();

        const visit = (engine) => {

            if (visited.has(engine.name))
                return;

            if (visiting.has(engine.name)) {
                throw new Error(
                    `Circular dependency detected involving ${engine.name}`
                );
            }

            visiting.add(engine.name);

            for (const dependency of engine.dependencies()) {

                const target =
                    [...map.values()]
                        .find(e =>
                            e.name.toLowerCase().startsWith(
                                dependency.toLowerCase()
                            )
                        );

                if (!target) {
                    throw new Error(
                        `Missing dependency '${dependency}' for '${engine.name}'`
                    );
                }

                visit(target);

            }

            visiting.delete(engine.name);

            visited.add(engine.name);

            resolved.push(engine);

        };

        for (const engine of engines)
            visit(engine);

        return resolved;

    }

}

module.exports = new DependencyResolver();
