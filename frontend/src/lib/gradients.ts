const GRADIENTS = [
    "from-violet-500 to-fuchsia-500",
    "from-sky-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-cyan-500 to-blue-500",
];

/** Stable gradient per study set, derived from its id. */
export function gradientFor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return GRADIENTS[hash % GRADIENTS.length];
}