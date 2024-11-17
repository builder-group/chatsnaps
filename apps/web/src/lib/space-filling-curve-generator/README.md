# Space Filling Curve

## References

- [P5.Js Sandbox](https://codesandbox.io/p/sandbox/space-filling-curve-n2mtmy)
- ["I've created a 'Random Marble Run' Generator" by @ferjerez3d on X](https://x.com/ferjerez3d/status/1233730556661305344)
- [Digital Halftoning Using Space-Filling Curves](https://dspace.jaist.ac.jp/dspace/bitstream/10119/4724/1/71.pdf)

---

### Random Space-Filling Curve

Given a lattice plane \( G \), a **space-filling curve** on \( G \) is a curve that visits every lattice point on \( G \) exactly once. Since the shape of the curve is not important, it is sometimes represented as a permutation of lattice points of \( G \). Many space-filling curves, such as **Hilbert** and **Peano** curves, are non-self-crossing, although this property is not a necessary condition for a curve to be space-filling.

In addition to these well-known curves, various other space-filling curves have been defined (see, for example, [8]). The idea of using space-filling curves for **digital halftoning** is not new. **Velho and Gomes** [11] use space-filling curves for cluster-dot dithering. **Zhang and Webber** [10] give a parallel halftoning algorithm based on space-filling curves. **Asano, Ranjan, and Roos** [2] formulate digital halftoning as a mathematical optimization problem and obtain an approximation algorithm based on space-filling curves.

While the use of space-filling curves in digital halftoning seems promising, there are challenges when the input image size is not a power of 2. Most recursively defined space-filling curves, such as Hilbert and Peano curves, are defined for square lattice planes of sizes that are powers of 2. The random space-filling curve proposed in this paper, however, can be defined for irregular-shaped lattice planes under certain reasonable conditions. A more precise description for such irregular-shaped lattice planes will be provided later.

One disadvantage of recursive space-filling curves arises from their shapes. When we draw space-filling curves by connecting consecutive vertices in the order specified by the curve, long straight gaps may occur. These gaps, which are horizontal or vertical line segments not intersecting the curve, can act as barriers to error propagation. Consequently, long straight gaps in the resulting image are easily recognizable. For instance, the serpentine rack has gaps as long as the side of the entire plane. In contrast, the random space-filling curve frequently changes direction, which minimizes the occurrence of long gaps. This property is one of the advantages of the random space-filling curve.

---

### Generating a Random Space-Filling Curve

#### Problem and Approach

The challenge is to determine how to generate random space-filling curves that can be defined on any even-sized rectangular lattice plane. The conditions for such a lattice plane are as follows:

1. The lattice consists of a grid resembling a checkerboard, as shown in **Figure 2**.
2. If the lattice consists of an odd number of cells (small squares), there is an imbalance between the number of black and white cells. As space-filling curves alternate cell colors, the length of the curve must be even, which means there cannot be a space-filling curve that starts and ends at cells of different colors.

To generate such curves, we present an **incremental algorithm** that incorporates randomness at each step.

#### Algorithm for Space-Filling Curves

Let \( A = (a_{ij}) \) represent a two-dimensional array with sides of even lengths. We partition the entire array into \( 2 \times 2 \) small arrays, where each cell \( b_{ij} \) consists of four elements from \( A \):

\[
b_{ij} = \{a_{2i,2j}, a_{2i+1,2j}, a_{2i,2j+1}, a_{2i+1,2j+1}\}
\]

The lattice graph is constructed by treating each small array as a vertex, and two vertices are connected by an edge if they are horizontally or vertically adjacent. **Figure 3** illustrates this lattice graph with vertices represented as black disks and edges as solid bold lines.

#### Generating the Spanning Tree

To generate a random space-filling curve, we need to find a **random spanning tree** of the lattice graph. The algorithm proceeds as follows:

1. **Select a starting vertex \( u \) on the external boundary** of the lattice graph.
2. **Initialize a tree \( T \)** with \( u \) as the root.
3. **Perform a recursive depth-first search (DFS)** to generate the spanning tree, choosing random adjacent vertices at each step.

```plaintext
G := lattice graph of the input image
V := set of vertices of G
Choose a vertex u on the external boundary of G
Let T be a tree with u as the root
Call recursive procedure rdfs(u)

procedure rdfs(u) {
    Mark u
    C(u) := set of unmarked vertices adjacent to u
    while(C(u) is not empty) {
        Remove a vertex v randomly from C(u)
        Add edge (u, v) to T
        Recursively call rdfs(v)
    }
}
```

#### Visualization of the Random Spanning Tree

**Figure 4(a)** shows an example of a random spanning tree. This tree represents a connected wall that defines a maze on the rectangular grid. By following the walls while keeping one hand touching them, we can traverse the entire image, as shown in **Figure 4(b)**, where the traversal path is depicted by dotted lines.

---

### Generalization to Irregular-Shaped Lattices

The above approach can be generalized to work with irregular-shaped lattices, which may include holes. The condition for such a lattice region is that it must be a collection of \( 2 \times 2 \) small lattice regions. Two such regions are considered fully adjacent if they share a horizontal or vertical side of length two. These small lattices must form a single connected component to form a valid space-filling curve.

