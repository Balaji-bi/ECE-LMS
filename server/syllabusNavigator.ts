import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiConfig = { 
  model: "gemini-1.5-pro" // Verified working model
};

// Create a router
export const syllabusRouter = Router();

// Syllabus data (based on the provided syllabus)
const syllabusData = [
  {
    semester: 1,
    subjects: [
      {
        code: "HS3152",
        name: "PROFESSIONAL ENGLISH",
        units: [
          {
            number: 1,
            title: "INTRODUCTION TO EFFECTIVE COMMUNICATION",
            topics: [
              "What is effective communication?",
              "Why is communication critical for excellence during study, research and work?",
              "Seven C’s of effective communication",
              "Key language skills",
              "Effective listening: What does it involve?",
              "Effective speaking",
              "Being an excellent reader",
              "Effective writing",
              "Developing language and communication skills",
              "Focus of the course",
              "Enhancing communication and language skills",
              "Learner responsibilities to enhance English language and communication skills"
            ]
          },
          {
            number: 2,
            title: "NARRATION AND SUMMATION",
            topics: [
              "Reading biographies, travelogues, newspaper reports, literature excerpts, travel & technical blogs",
              "Paragraph writing",
              "Short report on an event (e.g., field trip)",
              "Grammar: Past tense (simple), Subject-Verb Agreement, Prepositions",
              "Vocabulary: Word forms (prefixes & suffixes), Synonyms and Antonyms, Phrasal verbs"
            ]
          },
          {
            number: 3,
            title: "DESCRIPTION OF A PROCESS / PRODUCT",
            topics: [
              "Reading advertisements, gadget reviews, user manuals",
              "Writing definitions, instructions, product/process descriptions",
              "Grammar: Imperatives, Adjectives, Degrees of comparison, Present & Past Perfect Tenses",
              "Vocabulary: Compound nouns, Homonyms, Homophones, Discourse markers (connectives & sequence words)"
            ]
          },
          {
            number: 4,
            title: "CLASSIFICATION AND RECOMMENDATIONS",
            topics: [
              "Reading: Newspaper articles, Journal reports, Non-verbal communication (tables, pie charts, etc.)",
              "Note-making / Note-taking (study skills to be taught, not tested)",
              "Writing recommendations",
              "Transferring info from non-verbal (chart/graph) to verbal mode",
              "Grammar: Articles, Possessive & Relative pronouns",
              "Vocabulary: Collocations, Fixed / Semi-fixed expressions"
            ]
          },
          {
            number: 5,
            title: "EXPRESSION",
            topics: [
              "Reading: Editorials, Opinion blogs",
              "Essay writing (Descriptive or narrative)",
              "Grammar: Future tenses, Punctuation, Negation (statements & questions), Sentence types (Simple, Compound, Complex)",
              "Vocabulary: Cause & effect expressions, Content vs Function words"
            ]
          }
        ]
      },

      {
        code: "MA3151",
        name: "MATRICES AND CALCULUS",
        units: [
          {
            number: 1,
            title: "MATRICES",
            topics: [
              "Eigenvalues and Eigenvectors of a real matrix",
              "Characteristic equation",
              "Properties of Eigenvalues and Eigenvectors",
              "Cayley-Hamilton theorem",
              "Diagonalization of matrices by orthogonal transformation",
              "Reduction of a quadratic form to canonical form by orthogonal transformation",
              "Nature of quadratic forms",
              "Application: Stretching of an elastic membrane"
            ]
          },
          {
            number: 2,
            title: "DIFFERENTIAL CALCULUS",
            topics: [
              "Representation of functions",
              "Limit of a function",
              "Continuity",
              "Derivatives",
              "Differentiation rules (sum, product, quotient, chain rules)",
              "Implicit differentiation",
              "Logarithmic differentiation",
              "Application: Maxima and Minima of functions of one variable"
            ]
          },
          {
            number: 3,
            title: "FUNCTIONS OF SEVERAL VARIABLES",
            topics: [
              "Partial differentiation",
              "Homogeneous functions and Euler’s theorem",
              "Total derivative",
              "Change of variables",
              "Jacobians",
              "Partial differentiation of implicit functions",
              "Taylor’s series for functions of two variables",
              "Application: Maxima and minima of functions of two variables",
              "Lagrange’s method of undetermined multipliers"
            ]
          },
          {
            number: 4,
            title: "INTEGRAL CALCULUS",
            topics: [
              "Definite and indefinite integrals",
              "Substitution rule",
              "Techniques of integration: integration by parts, trigonometric integrals, trigonometric substitutions",
              "Integration of rational functions by partial fraction",
              "Integration of irrational functions",
              "Improper integrals",
              "Applications: Hydrostatic force and pressure, moments and centres of mass"
            ]
          },
          {
            number: 5,
            title: "MULTIPLE INTEGRALS",
            topics: [
              "Double integrals",
              "Change of order of integration",
              "Double integrals in polar coordinates",
              "Area enclosed by plane curves",
              "Triple integrals",
              "Volume of solids",
              "Change of variables in double and triple integrals",
              "Applications: Moments and centres of mass, moment of inertia"
            ]
          }
        ]
      },
      {
        code: "PH3151",
        name: "ENGINEERING PHYSICS",
        units: [
          {
            number: 1,
            title: "MECHANICS",
            topics: [
              "Center of mass (CM)",
              "CM of continuous bodies",
              "Motion of the CM",
              "Kinetic energy of the system of particles",
              "Rotation of rigid bodies",
              "Rotational kinematics",
              "Rotational kinetic energy and moment of inertia",
              "Theorems of M.I",
              "Moment of inertia of continuous bodies",
              "M.I of a diatomic molecule",
              "Torque",
              "Rotational dynamics of rigid bodies",
              "Conservation of angular momentum",
              "Rotational energy state of a rigid diatomic molecule",
              "Gyroscope"
            ]
          },
          {
            number: 2,
            title: "ELECTROMAGNETIC WAVES",
            topics: [
              "The Maxwell's equations",
              "Wave equation",
              "Plane electromagnetic waves in vacuum",
              "Conditions on the wave field",
              "Properties of electromagnetic waves: speed, amplitude, phase, orientation",
              "Waves in matter",
              "Polarization",
              "Producing electromagnetic waves",
              "Energy and momentum in EM waves",
              "Intensity, waves from localized sources, momentum and radiation pressure",
              "Cell-phone reception",
              "Reflection and transmission of electromagnetic waves"
            ]
          },
          {
            number: 3,
            title: "OSCILLATIONS, OPTICS AND LASERS",
            topics: [
              "Simple harmonic motion",
              "Resonance",
              "Analogy between electrical and mechanical oscillating systems",
              "Waves on a string",
              "Standing waves",
              "Traveling waves",
              "Energy transfer of a wave",
              "Sound waves",
              "Doppler effect",
              "Reflection and refraction of light waves",
              "Total internal reflection",
              "Interference",
              "Michelson interferometer",
              "Theory of air wedge and experiment",
              "Theory of laser",
              "Characteristics",
              "Spontaneous and stimulated emission",
              "Einstein's coefficients",
              "Population inversion"
            ]
          },
          {
            number: 4,
            title: "BASIC QUANTUM MECHANICS",
            topics: [
              "Photons and light waves",
              "Electrons and matter waves",
              "Compton effect",
              "The Schrodinger equation (Time dependent and time independent forms)",
              "Meaning of wave function",
              "Normalization",
              "Free particle",
              "Particle in a infinite potential well: 1D, 2D and 3D Boxes",
              "Normalization, probabilities and the correspondence principle"
            ]
          },
          {
            number: 5,
            title: "APPLIED QUANTUM MECHANICS",
            topics: [
              "The harmonic oscillator(qualitative)",
              "Barrier penetration and quantum tunneling(qualitative)",
              "Tunneling microscope",
              "Resonant diode",
              "Finite potential wells (qualitative)",
              "Bloch's theorem for particles in a periodic potential",
              "Basics of Kronig-Penney model and origin of energy bands"
            ]
          }
        ]
      },
      {
        code: "CY3151",
        name: "ENGINEERING CHEMISTRY",
        units: [
          {
            number: 1,
            title: "WATER AND ITS TREATMENT",
            topics: [
              "Sources and impurities of water",
              "Water quality parameters: color, odour, turbidity, pH, hardness, alkalinity, TDS, COD, BOD, fluoride, arsenic",
              "Municipal water treatment: primary treatment, disinfection (UV, ozonation, break-point chlorination)",
              "Desalination of brackish water: Reverse Osmosis",
              "Boiler troubles: Scale and sludge, boiler corrosion, caustic embrittlement, priming & foaming",
              "Treatment of boiler feed water: Internal treatment (phosphate, colloidal, sodium aluminate, calgon)",
              "External treatment: Ion exchange demineralization, zeolite process"
            ]
          },
          {
            number: 2,
            title: "NANOCHEMISTRY",
            topics: [
              "Distinction between molecules, nanomaterials, and bulk materials",
              "Size-dependent properties: optical, electrical, mechanical, magnetic",
              "Types of nanomaterials: nanoparticle, nanocluster, nanorod, nanowire, nanotube",
              "Preparation methods: sol-gel, solvothermal, laser ablation, chemical vapour deposition, electrochemical deposition, electrospinning",
              "Applications in medicine, agriculture, energy, electronics, and catalysis"
            ]
          },
          {
            number: 3,
            title: "PHASE RULE AND COMPOSITES",
            topics: [
              "Phase rule: Definitions of terms with examples",
              "One component system: water system",
              "Reduced phase rule, Thermal analysis",
              "Two component system: lead-silver system, Pattinson process",
              "Composites: Definition and need",
              "Matrix materials: Polymer, metal, ceramic",
              "Reinforcements: fiber, particulates, flakes, whiskers",
              "Types and applications: MMC, CMC, PMC",
              "Hybrid composites: definition and examples"
            ]
          },
          {
            number: 4,
            title: "FUELS AND COMBUSTION",
            topics: [
              "Classification of fuels",
              "Coal and coke: Proximate and ultimate analysis, carbonization",
              "Manufacture of metallurgical coke (Otto Hoffmann method)",
              "Synthetic petrol: Bergius process",
              "Knocking, Octane and Cetane numbers",
              "Power alcohol and biodiesel",
              "Calorific value: higher and lower",
              "Ignition temperature, spontaneous ignition, explosive range",
              "Flue gas analysis: ORSAT Method",
              "CO2 emission and carbon footprint"
            ]
          },
          {
            number: 5,
            title: "ENERGY SOURCES AND STORAGE DEVICES",
            topics: [
              "Stability of nucleus: mass defect, binding energy",
              "Nuclear energy: light water reactor, breeder reactor",
              "Solar energy: Principle, working, solar cells, new materials",
              "Wind and geothermal energy",
              "Batteries: dry cell, lead acid, lithium-ion",
              "Electric vehicles: working principles",
              "Fuel cells: H2-O2 fuel cell, microbial fuel cell",
              "Supercapacitors: Storage principle, types, examples"
            ]
          }
        ]
      },

      {
        code: "GE3151",
        name: "PROBLEM SOLVING AND PYTHON PROGRAMMING",
        units: [
          {
            number: 1,
            title: "COMPUTATIONAL THINKING AND PROBLEM SOLVING",
            topics: [
              "Fundamentals of Computing",
              "Identification of Computational Problems",
              "Algorithms",
              "Building blocks of algorithms (statements, state, control flow, functions)",
              "Notation (pseudo code, flow chart, programming language)",
              "Algorithmic problem solving",
              "Simple strategies for developing algorithms (iteration, recursion)",
              "Illustrative problems: find minimum in a list, insert a card in a list of sorted cards, guess an integer number in a range, Towers of Hanoi"
            ]
          },
          {
            number: 2,
            title: "DATA TYPES, EXPRESSIONS, STATEMENTS",
            topics: [
              "Python interpreter and interactive mode",
              "Debugging",
              "Values and types: int, float, boolean, string, and list",
              "Variables, expressions, statements",
              "Tuple assignment",
              "Precedence of operators",
              "Comments",
              "Illustrative programs: exchange the values of two variables, circulate the values of n variables, distance between two points"
            ]
          },
          {
            number: 3,
            title: "CONTROL FLOW, FUNCTIONS, STRINGS",
            topics: [
              "Conditionals: Boolean values and operators",
              "Conditional (if)",
              "Alternative (if-else)",
              "Chained conditional (if-elif-else)",
              "Iteration: state, while, for, break, continue, pass",
              "Fruitful functions: return values, parameters, local and global scope, function composition, recursion",
              "Strings: string slices, immutability, string functions and methods, string module",
              "Lists as arrays",
              "Illustrative programs: square root, gcd, exponentiation, sum an array of numbers, linear search, binary search"
            ]
          },
          {
            number: 4,
            title: "LISTS, TUPLES, DICTIONARIES",
            topics: [
              "Lists: list operations, list slices, list methods, list loop, mutability, aliasing, cloning lists, list parameters",
              "Tuples: tuple assignment, tuple as return value",
              "Dictionaries: operations and methods",
              "Advanced list processing - list comprehension",
              "Illustrative programs: simple sorting, histogram, Students marks statement, Retail bill preparation"
            ]
          },
          {
            number: 5,
            title: "FILES, MODULES, PACKAGES",
            topics: [
              "Files and exceptions: text files, reading and writing files, format operator",
              "Command line arguments",
              "Errors and exceptions, handling exceptions",
              "Modules, packages",
              "Illustrative programs: word count, copy file, Voter's age validation, Marks range validation (0-100)"
            ]
          }
        ]
      }
    ]
  },
  {
    semester: 2,
    subjects: [
      {
        code: "HS3252",
        name: "PROFESSIONAL ENGLISH II",
        units: [
          {
            number: 1,
            title: "MAKING COMPARISONS",
            topics: [
              "Reading advertisements, user manuals, brochures",
              "Writing professional emails and email etiquette",
              "Writing compare and contrast essays",
              "Grammar: Mixed tenses, prepositional phrases"
            ]
          },
          {
            number: 2,
            title: "EXPRESSING CAUSAL RELATIONS IN SPEAKING AND WRITING",
            topics: [
              "Reading technical texts, cause and effect essays, letters/emails of complaint",
              "Writing responses to complaints",
              "Grammar: Active and passive voice transformations, infinitives and gerunds"
            ]
          },
          {
            number: 3,
            title: "PROBLEM SOLVING",
            topics: [
              "Reading case studies, literary excerpts, news reports",
              "Writing letter to the editor, checklists, problem solution/argumentative essays",
              "Grammar: Error correction, conditional sentences (if)"
            ]
          },
          {
            number: 4,
            title: "REPORTING OF EVENTS AND RESEARCH",
            topics: [
              "Reading newspaper articles",
              "Writing recommendations, transcoding, accident reports, survey reports",
              "Grammar: Reported speech, modals",
              "Vocabulary: Conjunctions, use of prepositions"
            ]
          },
          {
            number: 5,
            title: "THE ABILITY TO PUT IDEAS OR INFORMATION COGENTLY",
            topics: [
              "Reading company profiles, statements of purpose, interviews with professionals",
              "Writing job/internship applications, cover letters, resumes",
              "Grammar: Numerical adjectives, relative clauses"
            ]
          }
        ]
      },
      {
        code: "MA3251",
        name: "STATISTICS AND NUMERICAL METHODS",
        units: [
          {
            number: 1,
            title: "TESTING OF HYPOTHESIS",
            topics: [
              "Sampling distributions",
              "Tests for single mean, proportion, and difference of means (large and small samples)",
              "Tests for single variance and equality of variances",
              "Chi-square test for goodness of fit",
              "Chi-square test for independence of attributes"
            ]
          },
          {
            number: 2,
            title: "DESIGN OF EXPERIMENTS",
            topics: [
              "One way and two way classifications",
              "Completely randomized design",
              "Randomized block design",
              "Latin square design",
              "Factorial design"
            ]
          },
          {
            number: 3,
            title: "SOLUTION OF EQUATIONS AND EIGENVALUE PROBLEMS",
            topics: [
              "Solution of algebraic and transcendental equations",
              "Fixed point iteration method",
              "Newton Raphson method",
              "Solution of linear system of equations",
              "Gauss elimination method",
              "Pivoting, Gauss Jordan method",
              "Iterative methods: Gauss Jacobi and Gauss Seidel",
              "Eigenvalues of a matrix: Power method, Jacobi’s method for symmetric matrices"
            ]
          },
          {
            number: 4,
            title: "INTERPOLATION, NUMERICAL DIFFERENTIATION AND NUMERICAL INTEGRATION",
            topics: [
              "Lagrange’s and Newton’s divided difference interpolations",
              "Newton’s forward and backward difference interpolation",
              "Approximation of derivatives using interpolation polynomials",
              "Numerical single and double integrations: Trapezoidal and Simpson’s 1/3 rules"
            ]
          },
          {
            number: 5,
            title: "NUMERICAL SOLUTION OF ORDINARY DIFFERENTIAL EQUATIONS",
            topics: [
              "Single step methods: Taylor’s series method, Euler’s method, Modified Euler’s method",
              "Fourth order Runge-Kutta method for first order differential equations",
              "Multi step methods: Milne’s method, Adams-Bashforth predictor-corrector method"
            ]
          }
        ]
      },

      {
        code: "EC3251",
        name: "CIRCUIT ANALYSIS",
        units: [
          {
            number: 1,
            title: "DC CIRCUIT ANALYSIS",
            topics: [
              "Basic Components of electric Circuits",
              "Charge, current, Voltage and Power",
              "Voltage and Current Sources",
              "Ohms Law",
              "Kirchoff's Current Law",
              "Kirchoff's voltage law",
              "The single Node – Pair Circuit",
              "Series and Parallel Connected Independent Sources",
              "Resistors in Series and Parallel",
              "Voltage and current division",
              "Nodal analysis",
              "Mesh analysis"
            ]
          },
          {
            number: 2,
            title: "NETWORK THEOREM AND DUALITY",
            topics: [
              "Useful Circuit Analysis techniques",
              "Linearity and superposition",
              "Thevenin and Norton Equivalent Circuits",
              "Maximum Power Transfer",
              "Delta-Wye Conversion",
              "Duals, Dual circuits",
              "Analysis using dependent current sources and voltage sources"
            ]
          },
          {
            number: 3,
            title: "SINUSOIDAL STEADY STATE ANALYSIS",
            topics: [
              "Sinusoidal Steady – State analysis",
              "Characteristics of Sinusoids",
              "The Complex Forcing Function",
              "The Phasor",
              "Phasor relationship for R, L, and C",
              "Impedance and Admittance",
              "Nodal and Mesh Analysis",
              "Phasor Diagrams",
              "AC Circuit Power Analysis",
              "Instantaneous Power",
              "Average Power",
              "Apparent Power and Power Factor",
              "Complex Power"
            ]
          },
          {
            number: 4,
            title: "TRANSIENTS AND RESONANCE IN RLC CIRCUITS",
            topics: [
              "Basic RL and RC Circuits",
              "The Source-Free RL Circuit",
              "The Source-Free RC Circuit",
              "The Unit-Step Function",
              "Driven RL Circuits",
              "Driven RC Circuits",
              "RLC Circuits",
              "Frequency Response",
              "Parallel Resonance",
              "Series Resonance",
              "Quality Factor"
            ]
          },
          {
            number: 5,
            title: "COUPLED CIRCUITS AND TOPOLOGY",
            topics: [
              "Magnetically Coupled Circuits",
              "Mutual Inductance",
              "The Linear Transformer",
              "The Ideal Transformer",
              "An introduction to Network Topology",
              "Trees and General Nodal analysis",
              "Links and Loop analysis"
            ]
          }
        ]
      },
      {
        code: "PH3254",
        name: "PHYSICS FOR ELECTRONICS ENGINEERING",
        units: [
          {
            number: 1,
            title: "CRYSTALLOGRAPHY",
            topics: [
              "Crystal structures: Crystal lattice",
              "Basis - unit cell and lattice parameters",
              "Crystal systems and Bravais lattices",
              "Structure and packing fractions of SC, BCC, FCC, diamond cubic, NaCL, ZnS structures",
              "Crystal planes, directions and Miller indices",
              "Distance between successive planes",
              "Linear and planar densities",
              "Crystalline and noncrystalline materials",
              "Example use of Miller indices: wafer surface orientation",
              "Wafer flats and notches",
              "Pattern alignment"
            ]
          },
          {
            number: 2,
            title: "ELECTRICAL AND MAGNETIC PROPERTIES OF MATERIALS",
            topics: [
              "Classical free electron theory",
              "Expression for electrical conductivity",
              "Thermal conductivity, expression",
              "Quantum free electron theory: Tunneling",
              "Degenerate states",
              "Fermi-Dirac statistics",
              "Density of energy states",
              "Electron in periodic potential",
              "Energy bands in solids",
              "Tight binding approximation",
              "Electron effective mass",
              "Concept of hole",
              "Magnetic materials: Dia, para and ferromagnetic effects",
              "Paramagnetism in the conduction electrons in metals"
            ]
          },
          {
            number: 3,
            title: "SEMICONDUCTORS AND TRANSPORT PHYSICS",
            topics: [
              "Intrinsic Semiconductors",
              "Energy band diagram",
              "Direct and indirect band gap semiconductors",
              "Carrier concentration in intrinsic semiconductors",
              "Extrinsic semiconductors",
              "Carrier concentration in N-type & P-type semiconductors",
              "Variation of carrier concentration with temperature",
              "Carrier transport in Semiconductors: Drift, mobility and diffusion",
              "Hall effect and devices",
              "Ohmic contacts",
              "Schottky diode"
            ]
          },
          {
            number: 4,
            title: "OPTICAL PROPERTIES OF MATERIALS",
            topics: [
              "Classification of optical materials",
              "Optical processes in semiconductors: optical absorption and emission, charge injection and recombination, optical absorption, loss and gain",
              "Optical processes in quantum wells",
              "Optoelectronic devices: light detectors and solar cells",
              "Light emitting diode",
              "Laser diode",
              "Optical processes in organic semiconductor devices",
              "Excitonic state",
              "Electro-optics and nonlinear optics: Modulators and switching devices",
              "Plasmonics"
            ]
          },
          {
            number: 5,
            title: "NANO DEVICES",
            topics: [
              "Density of states for solids",
              "Significance between Fermi energy and volume of the material",
              "Quantum confinement",
              "Quantum structures",
              "Density of states for quantum wells, wires and dots",
              "Band gap of nanomaterials",
              "Tunneling",
              "Single electron phenomena",
              "Single electron Transistor",
              "Conductivity of metallic nanowires",
              "Ballistic transport",
              "Quantum resistance and conductance",
              "Carbon nanotubes: Properties and applications",
              "Spintronic devices and applications"
            ]
          }
        ]
      },
      {
        code: "BE3254",
        name: "ELECTRICAL AND INSTRUMENTATION ENGINEERING",
        units: [
          {
            number: 1,
            title: "TRANSFORMER",
            topics: [
              "Ideal and practical transformer",
              "Phasor diagram",
              "Per unit system",
              "Equivalent circuit",
              "Testing of transformers",
              "Efficiency and voltage regulation",
              "Three-phase transformers",
              "Applications",
              "Auto transformers and advantages",
              "Harmonics"
            ]
          },
          {
            number: 2,
            title: "DC MACHINES",
            topics: [
              "Constructional features",
              "Motor and generator mode",
              "EMF and torque equation",
              "Circuit model",
              "Methods of excitation",
              "Characteristics",
              "Starting and speed control",
              "Universal motor",
              "Stepper motors",
              "Brushless DC motors",
              "Applications"
            ]
          },
          {
            number: 3,
            title: "AC ROTATING MACHINES",
            topics: [
              "Three-phase induction motors: Principle of operation, construction, types",
              "Equivalent circuit and speed control",
              "Single phase induction motors: Construction, types, starting methods",
              "Alternator: Working principle, EMF equation, voltage regulation",
              "Synchronous motors: Working principle, starting methods, torque equation"
            ]
          },
          {
            number: 4,
            title: "MEASUREMENTS AND INSTRUMENTATION",
            topics: [
              "Functional elements of an instrument",
              "Standards and calibration",
              "Operating principles and types of meters: Moving coil and moving iron",
              "Measurement of three-phase power",
              "Energy meter",
              "Instrument transformers: CT and PT",
              "DSO: Block diagram",
              "Data acquisition"
            ]
          },
          {
            number: 5,
            title: "BASICS OF POWER SYSTEMS",
            topics: [
              "Power system structure: Generation, transmission, and distribution",
              "Various voltage levels",
              "Earthing: Methods of earthing",
              "Protective devices: Switch fuse unit, MCB, MCCB, ELCB",
              "Safety precautions and first aid"
            ]
          }
        ]
      }
    ]
  },
  {
    semester: 3,
    subjects: [
      {
        code: "MA3355",
        name: "RANDOM PROCESSES AND LINEAR ALGEBRA",
        units: [
          {
            number: 1,
            title: "PROBABILITY AND RANDOM VARIABLES",
            topics: [
              "Axioms of probability",
              "Conditional probability",
              "Baye’s theorem",
              "Discrete and continuous random variables",
              "Moments and moment generating functions",
              "Binomial distribution",
              "Poisson distribution",
              "Geometric distribution",
              "Uniform distribution",
              "Exponential distribution",
              "Normal distribution",
              "Functions of a random variable"
            ]
          },
          {
            number: 2,
            title: "TWO-DIMENSIONAL RANDOM VARIABLES",
            topics: [
              "Joint distributions",
              "Marginal and conditional distributions",
              "Covariance and correlation",
              "Linear regression",
              "Transformation of random variables",
              "Central limit theorem (for independent and identically distributed variables)"
            ]
          },
          {
            number: 3,
            title: "RANDOM PROCESSES",
            topics: [
              "Classification of random processes",
              "Stationary process",
              "Markov process",
              "Poisson process",
              "Discrete parameter Markov chain",
              "Chapman-Kolmogorov equations (statement only)",
              "Limiting distributions"
            ]
          },
          {
            number: 4,
            title: "VECTOR SPACES",
            topics: [
              "Vector spaces and subspaces",
              "Linear combinations and linear system of equations",
              "Linear independence and linear dependence",
              "Bases and dimensions"
            ]
          },
          {
            number: 5,
            title: "LINEAR TRANSFORMATION AND INNER PRODUCT SPACES",
            topics: [
              "Linear transformation",
              "Null spaces and ranges",
              "Dimension theorem",
              "Matrix representation of linear transformations",
              "Inner product and norms",
              "Gram-Schmidt orthogonalization process",
              "Adjoint of linear operations",
              "Least square approximation"
            ]
          }
        ]
      },
      {
        code: "CS3353",
        name: "C PROGRAMMING AND DATA STRUCTURES",
        units: [
          {
            number: 1,
            title: "C PROGRAMMING FUNDAMENTALS",
            topics: [
              "Data types and variables",
              "Operations, expressions, and statements",
              "Conditional statements",
              "Functions and recursive functions",
              "Arrays: single and multi-dimensional"
            ]
          },
          {
            number: 2,
            title: "C PROGRAMMING - ADVANCED FEATURES",
            topics: [
              "Structures and unions",
              "Enumerated data types",
              "Pointers to variables, arrays, and functions",
              "File handling",
              "Preprocessor directives"
            ]
          },
          {
            number: 3,
            title: "LINEAR DATA STRUCTURES",
            topics: [
              "Abstract Data Types (ADTs)",
              "List ADT: array-based implementation",
              "Linked list: singly, doubly, and circular",
              "Stack ADT and its applications",
              "Queue ADT, priority queues, and their applications"
            ]
          },
          {
            number: 4,
            title: "NON-LINEAR DATA STRUCTURES",
            topics: [
              "Trees and binary trees",
              "Tree traversals and expression trees",
              "Binary Search Tree (BST)",
              "Hashing: hash functions, separate chaining, open addressing",
              "Linear probing, quadratic probing, double hashing, rehashing"
            ]
          },
          {
            number: 5,
            title: "SORTING AND SEARCHING TECHNIQUES",
            topics: [
              "Insertion sort",
              "Quick sort",
              "Heap sort",
              "Merge sort",
              "Linear search",
              "Binary search"
            ]
          }
        ]
      },
      {
        code: "EC3354",
        name: "SIGNALS AND SYSTEMS",
        units: [
          {
            number: 1,
            title: "CLASSIFICATION OF SIGNALS AND SYSTEMS",
            topics: [
              "Standard signals: Step, Ramp, Pulse, Impulse, Real and complex exponentials, Sinusoids",
              "Classification of signals: CT and DT, Periodic & Aperiodic, Deterministic & Random, Energy & Power signals",
              "Classification of systems: CT and DT systems, Linear & Nonlinear, Time-variant & Time-invariant, Causal & Non-causal, Stable & Unstable"
            ]
          },
          {
            number: 2,
            title: "ANALYSIS OF CONTINUOUS TIME SIGNALS",
            topics: [
              "Fourier series for periodic signals",
              "Fourier Transform and its properties",
              "Laplace Transforms and its properties"
            ]
          },
          {
            number: 3,
            title: "LINEAR TIME INVARIANT CONTINUOUS TIME SYSTEMS",
            topics: [
              "Impulse response and convolution integrals",
              "Differential equation representation",
              "Fourier and Laplace transforms in CT system analysis",
              "Systems connected in series and parallel"
            ]
          },
          {
            number: 4,
            title: "ANALYSIS OF DISCRETE TIME SIGNALS",
            topics: [
              "Baseband signal sampling",
              "DTFT (Discrete Time Fourier Transform) and its properties",
              "Z-transform and its properties"
            ]
          },
          {
            number: 5,
            title: "LINEAR TIME INVARIANT-DISCRETE TIME SYSTEMS",
            topics: [
              "Impulse response and difference equations",
              "Convolution sum",
              "DFT and Z-transform analysis",
              "Analysis of recursive and non-recursive systems",
              "DT systems connected in series and parallel"
            ]
          }
        ]
      },
      {
        code: "EC3353",
        name: "ELECTRONIC DEVICES AND CIRCUITS",
        units: [
          {
            number: 1,
            title: "SEMICONDUCTOR DEVICES",
            topics: [
              "PN junction diode and Zener diode",
              "BJT, MOSFET, UJT: structure, operation, and V-I characteristics",
              "Diffusion and transition capacitance",
              "Rectifiers: Half-wave and Full-wave",
              "Zener diode as a voltage regulator"
            ]
          },
          {
            number: 2,
            title: "AMPLIFIERS",
            topics: [
              "Load line and operating point",
              "Biasing methods for BJT and MOSFET",
              "BJT small signal model",
              "Analysis of CE, CB, CC amplifiers: Gain and frequency response",
              "MOSFET small signal model",
              "Analysis of CS, CG, Source follower: Gain and frequency response",
              "High-frequency analysis"
            ]
          },
          {
            number: 3,
            title: "MULTISTAGE AMPLIFIERS AND DIFFERENTIAL AMPLIFIER",
            topics: [
              "Cascode amplifier",
              "Differential amplifier: Common mode and differential mode analysis",
              "MOSFET input stages",
              "Tuned amplifiers: Gain and frequency response",
              "Neutralization methods"
            ]
          },
          {
            number: 4,
            title: "FEEDBACK AMPLIFIERS AND OSCILLATORS",
            topics: [
              "Advantages of negative feedback",
              "Types: Voltage/Current, Series/Shunt feedback amplifiers",
              "Positive feedback and condition for oscillations",
              "Phase shift, Wien bridge, Hartley, Colpitts, and Crystal oscillators"
            ]
          },
          {
            number: 5,
            title: "POWER AMPLIFIERS AND DC/DC CONVERTERS",
            topics: [
              "Power amplifiers: Class A, B, AB, C",
              "Power MOSFET and temperature effects",
              "Class AB power amplifier using MOSFET",
              "DC/DC converters: Buck, Boost, Buck-Boost – analysis and design"
            ]
          }
        ]
      },
      {
        code: "EC3351",
        name: "CONTROL SYSTEMS",
        units: [
          {
            number: 1,
            title: "SYSTEMS COMPONENTS AND THEIR REPRESENTATION",
            topics: [
              "Control System: Terminology and basic structure",
              "Feedforward and feedback control theory",
              "Electrical and mechanical transfer function models",
              "Block diagram models",
              "Signal flow graph models",
              "DC and AC servo systems",
              "Synchronous systems",
              "Multivariable control systems"
            ]
          },
          {
            number: 2,
            title: "TIME RESPONSE ANALYSIS",
            topics: [
              "Transient and steady state response",
              "Performance measures for first and second order systems",
              "Effect of an additional zero and additional pole",
              "Steady state error constants and system type number",
              "PID control",
              "Analytical design for PD, PI, and PID control systems"
            ]
          },
          {
            number: 3,
            title: "FREQUENCY RESPONSE AND SYSTEM ANALYSIS",
            topics: [
              "Closed loop frequency response",
              "Performance specification in frequency domain",
              "Frequency response of standard second order system",
              "Bode plot, Polar plot, Nyquist plots",
              "Design of compensators using Bode plots",
              "Cascade lead, lag, and lag-lead compensation"
            ]
          },
          {
            number: 4,
            title: "CONCEPTS OF STABILITY ANALYSIS",
            topics: [
              "Concept of stability",
              "Bounded Input Bounded Output (BIBO) stability",
              "Routh-Hurwitz stability criterion",
              "Relative stability",
              "Root locus concept and sketching guidelines",
              "Nyquist stability criterion"
            ]
          },
          {
            number: 5,
            title: "CONTROL SYSTEM ANALYSIS USING STATE VARIABLE METHODS",
            topics: [
              "State variable representation",
              "Conversion between state variable models and transfer functions",
              "Solution of state equations",
              "Controllability and observability",
              "Stability of linear systems",
              "Equivalence of transfer function and state variable representations",
              "State variable analysis of digital control systems",
              "Digital control design using state feedback"
            ]
          }
        ]
      },
      {
        code: "EC3352",
        name: "DIGITAL SYSTEMS DESIGN",
        units: [
          {
            number: 1,
            title: "BASIC CONCEPTS",
            topics: [
              "Review of number systems: representation and conversions",
              "Review of Boolean algebra and theorems",
              "Sum of Product (SOP) and Product of Sum (POS) simplification",
              "Canonical forms: min term and max term",
              "Karnaugh map simplification for completely and incompletely specified functions",
              "Implementation using universal gates",
              "Tabulation methods for simplification"
            ]
          },
          {
            number: 2,
            title: "COMBINATIONAL LOGIC CIRCUITS",
            topics: [
              "Design of combinational circuits",
              "Code converters",
              "Half adder and full adder",
              "Binary parallel adder and carry look-ahead adder",
              "BCD adder",
              "Magnitude comparator",
              "Decoder, encoder, priority encoder",
              "Multiplexer and demultiplexer",
              "Case study: Digital trans-receiver, 8-bit ALU, parity generator/checker, seven segment display decoder"
            ]
          },
          {
            number: 3,
            title: "SYNCHRONOUS SEQUENTIAL CIRCUITS",
            topics: [
              "Latches and flip-flops: SR, JK, T, D, Master/Slave",
              "Triggering of flip-flops",
              "Analysis and design of clocked sequential circuits",
              "Design using Moore and Mealy models",
              "State minimization and assignment",
              "Lock-out condition and circuit implementation",
              "Counters: ripple, ring",
              "Shift registers and universal shift register",
              "Model development: rolling display, real-time clock"
            ]
          },
          {
            number: 4,
            title: "ASYNCHRONOUS SEQUENTIAL CIRCUITS",
            topics: [
              "Stable and unstable states",
              "Output specifications",
              "Cycles and races",
              "State reduction",
              "Race-free assignments",
              "Hazards: essential and logic",
              "Fundamental and pulse mode sequential circuits",
              "Design of hazard-free circuits"
            ]
          },
          {
            number: 5,
            title: "LOGIC FAMILIES AND PROGRAMMABLE LOGIC DEVICES",
            topics: [
              "Logic families: RTL, TTL, ECL, CMOS",
              "Parameters: propagation delay, fan-in, fan-out, noise margin",
              "Comparison of logic families",
              "Implementation using standard ICs",
              "PROM, PLA, and PAL",
              "Basic memory: static ROM, PROM, EPROM, EEPROM, EAPROM"
            ]
          }
        ]
      }
    ]
  },
  {
    semester: 4,
    subjects: [
      {
        code: "EC3452",
        name: "ELECTROMAGNETIC FIELDS",
        units: [
          {
            number: 1,
            title: "INTRODUCTION",
            topics: [
              "Electromagnetic model, units and constants",
              "Review of vector algebra",
              "Coordinate systems: Rectangular, cylindrical, spherical",
              "Line, surface and volume integrals",
              "Gradient of a scalar field",
              "Divergence and divergence theorem",
              "Curl and Stokes' theorem",
              "Null identities and Helmholtz's theorem",
              "Verification of vector theorems for different paths, surfaces, and volumes"
            ]
          },
          {
            number: 2,
            title: "ELECTROSTATICS",
            topics: [
              "Electric field and Coulomb's law",
              "Gauss's law and applications",
              "Electric potential",
              "Conductors and dielectrics in static electric fields",
              "Electric flux density and dielectric constant",
              "Boundary conditions",
              "Electrostatic boundary value problems",
              "Capacitance: parallel, cylindrical, and spherical capacitors",
              "Electrostatic energy",
              "Poisson’s and Laplace’s equations",
              "Uniqueness of electrostatic solutions",
              "Current density and Ohm’s law",
              "EMF and Kirchhoff’s voltage law",
              "Equation of continuity and Kirchhoff’s current law"
            ]
          },
          {
            number: 3,
            title: "MAGNETOSTATICS",
            topics: [
              "Lorentz force equation",
              "Ampere’s law",
              "Vector magnetic potential",
              "Biot–Savart law and applications",
              "Magnetic field intensity and relative permeability",
              "Magnetic field for different current distributions",
              "Magnetic circuits and materials",
              "Boundary conditions in magnetic fields",
              "Inductance and inductors",
              "Magnetic energy, forces, and torques"
            ]
          },
          {
            number: 4,
            title: "TIME-VARYING FIELDS AND MAXWELL'S EQUATIONS",
            topics: [
              "Faraday’s law",
              "Displacement current and Maxwell–Ampere law",
              "Maxwell’s equations (differential and integral form)",
              "Potential functions",
              "Electromagnetic boundary conditions",
              "Wave equations and their solutions",
              "Time-harmonic fields",
              "Observation of wave propagation using Maxwell’s equations"
            ]
          },
          {
            number: 5,
            title: "PLANE ELECTROMAGNETIC WAVES",
            topics: [
              "Plane waves in lossless media",
              "Plane waves in lossy media: low-loss dielectrics and good conductors",
              "Group velocity",
              "Electromagnetic power flow and Poynting vector",
              "Normal incidence at plane conducting boundary",
              "Normal incidence at plane dielectric boundary"
            ]
          }
        ]
      },
      {
        code: "EC3401",
        name: "NETWORKS AND SECURITY",
        units: [
          {
            number: 1,
            title: "NETWORK MODELS AND DATALINK LAYER",
            topics: [
              "Overview of networks and its attributes",
              "Network models: OSI and TCP/IP",
              "Addressing concepts",
              "Introduction to data link layer",
              "Error detection and correction",
              "Ethernet (802.3)",
              "Wireless LAN: IEEE 802.11, Bluetooth",
              "Flow and error control protocols",
              "HDLC and PPP"
            ]
          },
          {
            number: 2,
            title: "NETWORK LAYER PROTOCOLS",
            topics: [
              "Network layer and IPv4 addressing",
              "Network layer protocols: IP, ICMP, Mobile IP",
              "Unicast and multicast routing",
              "Intradomain and interdomain routing protocols",
              "IPv6 addresses and datagram format",
              "Transition from IPv4 to IPv6"
            ]
          },
          {
            number: 3,
            title: "TRANSPORT AND APPLICATION LAYERS",
            topics: [
              "Transport layer protocols: UDP and TCP",
              "Connection and state transition diagram",
              "Congestion control and avoidance: DEC bit, RED",
              "Quality of Service (QoS)",
              "Application layer paradigms",
              "Client-server programming",
              "Domain Name System (DNS)",
              "World Wide Web, HTTP, Electronic mail"
            ]
          },
          {
            number: 4,
            title: "NETWORK SECURITY",
            topics: [
              "OSI security architecture",
              "Types of attacks",
              "Security services and mechanisms",
              "Encryption techniques",
              "Advanced Encryption Standard (AES)",
              "Public key cryptosystems: RSA algorithm",
              "Hash functions and Secure Hash Algorithm (SHA)",
              "Digital Signature Algorithm"
            ]
          },
          {
            number: 5,
            title: "HARDWARE SECURITY",
            topics: [
              "Introduction to hardware security",
              "Hardware Trojans",
              "Side-channel attacks",
              "Physical attacks and countermeasures",
              "Design for security",
              "Introduction to blockchain technology"
            ]
          }
        ]
      },
      {
        code: "EC3451",
        name: "LINEAR INTEGRATED CIRCUITS",
        units: [
          {
            number: 1,
            title: "BASICS OF OPERATIONAL AMPLIFIERS",
            topics: [
              "Current mirror and current sources",
              "Current sources as active loads",
              "Voltage sources and voltage references",
              "BJT differential amplifier with active loads",
              "Ideal operational amplifier characteristics",
              "General op-amp stages and internal circuit of IC 741",
              "DC and AC performance characteristics",
              "Slew rate",
              "Open and closed loop configurations",
              "MOSFET operational amplifiers – LF155 and TL082"
            ]
          },
          {
            number: 2,
            title: "APPLICATIONS OF OPERATIONAL AMPLIFIERS",
            topics: [
              "Sign changer and scale changer",
              "Phase shift circuits",
              "Voltage follower",
              "V-to-I and I-to-V converters",
              "Adder and subtractor circuits",
              "Instrumentation amplifier",
              "Integrator and differentiator",
              "Logarithmic and antilogarithmic amplifiers",
              "Comparators and Schmitt trigger",
              "Precision rectifier, peak detector, clipper and clamper",
              "Active filters: low-pass, high-pass, band-pass (Butterworth)"
            ]
          },
          {
            number: 3,
            title: "ANALOG MULTIPLIER AND PLL",
            topics: [
              "Analog multiplier using emitter-coupled transistor pair",
              "Gilbert multiplier cell",
              "Variable transconductance technique",
              "Analog multiplier ICs and applications",
              "Basic PLL operation and closed loop analysis",
              "Voltage controlled oscillator (VCO)",
              "Monolithic PLL IC 565",
              "PLL applications: AM and FM detection, FSK modulation/demodulation, frequency synthesizing, clock synchronization"
            ]
          },
          {
            number: 4,
            title: "ANALOG TO DIGITAL AND DIGITAL TO ANALOG CONVERTERS",
            topics: [
              "Analog and digital data conversions",
              "D/A converters: Specifications, weighted resistor, R-2R ladder types",
              "Voltage mode and current mode R-2R ladders",
              "Switches for D/A converters",
              "High-speed sample-and-hold circuits",
              "A/D converters: Flash, successive approximation, single slope, dual slope",
              "A/D using voltage-to-time conversion",
              "Oversampling and sigma-delta converters"
            ]
          },
          {
            number: 5,
            title: "WAVEFORM GENERATORS AND SPECIAL FUNCTION ICS",
            topics: [
              "Sine-wave, triangular, and sawtooth wave generators",
              "Multivibrators and ICL8038 function generator",
              "Timer IC 555",
              "IC voltage regulators: Three-terminal fixed and adjustable, IC 723 general purpose",
              "Monolithic switching regulator, LDO regulators",
              "Switched capacitor filter IC MF10",
              "Frequency-to-voltage and voltage-to-frequency converters",
              "Audio power amplifier, video amplifier",
              "Isolation amplifier, opto-couplers, fiber optic ICs"
            ]
          }
        ]
      },
      {
        code: "EC3492",
        name: "DIGITAL SIGNAL PROCESSING",
        units: [
          {
            number: 1,
            title: "DISCRETE FOURIER TRANSFORM",
            topics: [
              "Sampling Theorem",
              "Concept of frequency in discrete-time signals",
              "Analysis & synthesis equations for FT & DTFT",
              "Frequency domain sampling",
              "Discrete Fourier transform (DFT) - deriving DFT from DTFT",
              "Properties of DFT - periodicity, symmetry, circular convolution",
              "Linear filtering using DFT",
              "Filtering long data sequences - overlap save and overlap add method",
              "Fast computation of DFT - Radix-2 Decimation-in-time (DIT) FFT",
              "Radix-2 Decimation-in-frequency (DIF) FFT",
              "Linear filtering using FFT"
            ]
          },
          {
            number: 2,
            title: "INFINITE IMPULSE RESPONSE FILTERS",
            topics: [
              "Characteristics of practical frequency selective filters",
              "Characteristics of commonly used analog filters - Butterworth, Chebyshev",
              "Design of IIR filters from analog filters (LPF, HPF, BPF, BRF)",
              "Approximation of derivatives",
              "Impulse invariance method",
              "Bilinear transformation",
              "Frequency transformation in the analog domain",
              "Structure of IIR filter - direct form I, direct form II, Cascade, parallel realizations"
            ]
          },
          {
            number: 3,
            title: "FINITE IMPULSE RESPONSE FILTERS",
            topics: [
              "Design of FIR filters - symmetric and Anti-symmetric FIR filters",
              "Design of linear phase FIR filters using Fourier series method",
              "FIR filter design using windows - Rectangular, Hamming and Hanning window",
              "Frequency sampling method",
              "FIR filter structures - linear phase structure, direct form realizations"
            ]
          },
          {
            number: 4,
            title: "FINITE WORD LENGTH EFFECTS",
            topics: [
              "Fixed point and floating point number representation",
              "ADC - quantization - truncation and rounding",
              "Quantization noise",
              "Input/output quantization",
              "Coefficient quantization error",
              "Product quantization error",
              "Overflow error",
              "Limit cycle oscillations due to product quantization and summation",
              "Scaling to prevent overflow"
            ]
          },
          {
            number: 5,
            title: "DSP APPLICATIONS",
            topics: [
              "Multirate signal processing: Decimation, Interpolation, Sampling rate conversion by a rational factor",
              "Adaptive Filters: Introduction",
              "Applications of adaptive filtering to equalization",
              "DSP Architecture - Fixed and Floating point architecture principles"
            ]
          }
        ]
      },
      {
        code: "EC3491",
        name: "COMMUNICATION SYSTEMS",
        units: [
          {
            number: 1,
            title: "AMPLITUDE MODULATION",
            topics: [
              "Review of signals and systems",
              "Time and Frequency domain representation of signals",
              "Principles of Amplitude Modulation Systems - DSB, SSB and VSB modulations",
              "Angle Modulation - Representation of FM and PM signals",
              "Spectral characteristics of angle modulated signals",
              "SSB Generation – Filter and Phase Shift Methods",
              "VSB Generation – Filter Method",
              "Hilbert Transform",
              "Pre-envelope and complex envelope",
              "AM techniques",
              "Superheterodyne Receiver"
            ]
          },
          {
            number: 2,
            title: "RANDOM PROCESS & SAMPLING",
            topics: [
              "Review of probability and random process",
              "Gaussian and white noise characteristics",
              "Noise in amplitude modulation systems",
              "Noise in Frequency modulation systems",
              "Pre-emphasis and De-emphasis",
              "Threshold effect in angle modulation",
              "Low pass sampling – Aliasing",
              "Signal Reconstruction",
              "Quantization - Uniform & non-uniform quantization",
              "Quantization noise",
              "Nyquist criterion",
              "Logarithmic Companding",
              "PAM, PPM, PWM, PCM",
              "TDM, FDM"
            ]
          },
          {
            number: 3,
            title: "DIGITAL TECHNIQUES",
            topics: [
              "Pulse modulation",
              "Differential pulse code modulation",
              "Delta modulation",
              "Noise considerations in PCM",
              "Digital Multiplexers",
              "Channel coding theorem",
              "Linear Block codes",
              "Hamming codes",
              "Cyclic codes",
              "Convolutional codes",
              "Viterbi Decoder"
            ]
          },
          {
            number: 4,
            title: "DIGITAL MODULATION SCHEME",
            topics: [
              "Geometric Representation of signals",
              "Generation, detection, IQ representation, PSD & BER of Coherent BPSK, BFSK, & QPSK",
              "QAM",
              "Carrier Synchronization",
              "Structure of Non-coherent Receivers",
              "Synchronization and Carrier Recovery for Digital modulation",
              "Spectrum Analysis – Occupied bandwidth – Adjacent channel power",
              "EVM",
              "Principle of DPSK"
            ]
          },
          {
            number: 5,
            title: "DEMODULATION TECHNIQUES",
            topics: [
              "Elements of Detection Theory",
              "Optimum detection of signals in noise",
              "Coherent communication with waveforms",
              "Probability of Error evaluations",
              "Baseband Pulse Transmission",
              "Inter symbol Interference",
              "Optimum demodulation of digital signals over band-limited channels"
            ]
          }
        ]
      },
      {
        code: "GE3451",
        name: "ENVIRONMENTAL SCIENCES AND SUSTAINABILITY",
        units: [
          {
            number: 1,
            title: "ENVIRONMENT AND BIODIVERSITY",
            topics: [
              "Definition, scope and importance of environment",
              "Need for public awareness",
              "Eco-system and Energy flow",
              "Ecological succession",
              "Types of biodiversity: genetic, species and ecosystem diversity",
              "Values of biodiversity",
              "India as a mega-diversity nation",
              "Hot-spots of biodiversity",
              "Threats to biodiversity: habitat loss, poaching of wildlife, man-wildlife conflicts",
              "Endangered and endemic species of India",
              "Conservation of biodiversity: In-situ and Ex-situ"
            ]
          },
          {
            number: 2,
            title: "ENVIRONMENTAL POLLUTION",
            topics: [
              "Causes, Effects and Preventive measures of Water, Soil, Air and Noise Pollutions",
              "Solid Waste management",
              "Hazardous Waste management",
              "E-Waste management",
              "Case studies on Occupational Health and Safety Management System (OHASMS)",
              "Environmental protection acts"
            ]
          },
          {
            number: 3,
            title: "RENEWABLE SOURCES OF ENERGY",
            topics: [
              "Energy management and conservation",
              "Need of new energy sources",
              "Different types of new energy sources",
              "Applications of Hydrogen energy",
              "Applications of Ocean energy resources",
              "Tidal energy conversion",
              "Geothermal energy - concept, origin, power plants"
            ]
          },
          {
            number: 4,
            title: "SUSTAINABILITY AND MANAGEMENT",
            topics: [
              "Development, GDP, Sustainability - concept, needs and challenges",
              "Economic, social and technological aspects of sustainability",
              "From unsustainability to sustainability",
              "Millennium Development Goals and protocols",
              "Sustainable Development Goals - targets, indicators and intervention areas",
              "Climate change - Global, Regional and Local environmental issues and solutions",
              "Concept of Carbon Credit and Carbon Footprint",
              "Environmental management in industry - Case study"
            ]
          },
          {
            number: 5,
            title: "SUSTAINABILITY PRACTICES",
            topics: [
              "Zero waste and R concept",
              "Circular economy",
              "ISO 14000 Series",
              "Material Life Cycle Assessment",
              "Environmental Impact Assessment",
              "Sustainable habitat: Green buildings, Green materials, Energy efficiency",
              "Sustainable transports",
              "Sustainable energy: Non-conventional Sources, Energy Cycles - carbon cycle, emission and sequestration",
              "Green Engineering: Sustainable urbanization - Socio-economical and technological change"
            ]
          }
        ]
      }
    ]
  },
  {
    semester: 5,
    subjects: [
      {
        code: "EC3501",
        name: "WIRELESS COMMUNICATION",
        units: [
          {
            number: 1,
            title: "THE CELLULAR CONCEPT – SYSTEM DESIGN FUNDAMENTALS",
            topics: [
              "Introduction",
              "Frequency Reuse",
              "Channel Assignment Strategies",
              "Handoff Strategies: Prioritizing Handoffs, Practical Handoff Considerations",
              "Interference and System Capacity",
              "Co-Channel Interference and System Capacity",
              "Channel Planning for Wireless Systems",
              "Adjacent Channel Interference",
              "Power Control for Reducing Interference",
              "Trunking and Grade of Service",
              "Improving Coverage and Capacity in Cellular Systems: Cell Splitting, Sectoring"
            ]
          },
          {
            number: 2,
            title: "MOBILE RADIO PROPAGATION",
            topics: [
              "Large Scale Path Loss: Introduction to Radio Wave Propagation",
              "Free Space Propagation Model",
              "Three Basic Propagation Mechanisms: Reflection, Diffraction, Scattering",
              "Small Scale Fading and Multipath",
              "Factors Influencing Small-Scale Fading",
              "Doppler Shift, Coherence Bandwidth, Doppler Spread and Coherence Time",
              "Types of Small-Scale Fading: Fading Effects Due to Multipath Time Delay Spread, Due to Doppler Spread"
            ]
          },
          {
            number: 3,
            title: "MODULATION TECHNIQUES AND EQUALIZATION AND DIVERSITY",
            topics: [
              "Overview of Digital Modulation",
              "Factors That Influence the Choice of Digital Modulation",
              "Linear Modulation Techniques: MSK, GMSK",
              "Spread Spectrum Techniques: PN Sequences, DS-SS",
              "Modulation Performance in Fading and Multipath Channels",
              "Equalization",
              "Diversity Techniques: Practical Space Diversity Considerations, Polarization, Frequency, and Time Diversity",
              "Channel Coding Fundamentals"
            ]
          },
          {
            number: 4,
            title: "MULTIPLE ACCESS TECHNIQUES",
            topics: [
              "Introduction to Multiple Access",
              "Frequency Division Multiple Access (FDMA)",
              "Time Division Multiple Access (TDMA)",
              "Spread Spectrum Multiple Access – Code Division Multiple Access (CDMA)",
              "Space Division Multiple Access (SDMA)",
              "Capacity of Cellular Systems: CDMA Capacity, CDMA with Multiple Cells"
            ]
          },
          {
            number: 5,
            title: "WIRELESS NETWORKING",
            topics: [
              "Difference Between Wireless and Fixed Telephone Networks",
              "Public Switched Telephone Network (PSTN)",
              "Development of Wireless Networks: 1G, 2G, 3G",
              "Fixed Network Transmission Hierarchy",
              "Traffic Routing in Wireless Networks: Circuit Switching, Packet Switching",
              "PCS/PCNs: Packet vs Circuit Switching",
              "Cellular Packet-Switched Architecture",
              "Packet Reservation Multiple Access (PRMA)",
              "Network Databases: Distributed Database for Mobility Management",
              "Universal Mobile Telecommunication Systems (UMTS)"
            ]
          }
        ]
      },
      {
        code: "EC3552",
        name: "VLSI AND CHIP DESIGN",
        units: [
          {
            number: 1,
            title: "MOS TRANSISTOR PRINCIPLES",
            topics: [
              "MOS logic families (NMOS and CMOS)",
              "Ideal and Non-Ideal IV Characteristics",
              "CMOS devices",
              "MOSFET Transistor Characteristics under Static and Dynamic Conditions",
              "Technology Scaling",
              "Power Consumption"
            ]
          },
          {
            number: 2,
            title: "COMBINATIONAL LOGIC CIRCUITS",
            topics: [
              "Propagation Delays",
              "Stick Diagram",
              "Layout Diagrams",
              "Examples of Combinational Logic Design",
              "Elmore’s Constant",
              "Static Logic Gates",
              "Dynamic Logic Gates",
              "Pass Transistor Logic",
              "Power Dissipation",
              "Low Power Design Principles"
            ]
          },
          {
            number: 3,
            title: "SEQUENTIAL LOGIC CIRCUITS AND CLOCKING STRATEGIES",
            topics: [
              "Static Latches and Registers",
              "Dynamic Latches and Registers",
              "Pipelines",
              "Non-bistable Sequential Circuits",
              "Timing Classification of Digital Systems",
              "Synchronous Design",
              "Self-Timed Circuit Design"
            ]
          },
          {
            number: 4,
            title: "INTERCONNECT, MEMORY ARCHITECTURE AND ARITHMETIC CIRCUITS",
            topics: [
              "Interconnect Parameters – Capacitance, Resistance, and Inductance",
              "Electrical Wire Models",
              "Sequential Digital Circuits: Adders, Multipliers, Comparators, Shift Registers",
              "Logic Implementation using Programmable Devices (ROM, PLA, FPGA)",
              "Memory Architecture and Building Blocks",
              "Memory Core and Memory Peripherals Circuitry"
            ]
          },
          {
            number: 5,
            title: "ASIC DESIGN AND TESTING",
            topics: [
              "Wafer to Chip Fabrication Process Flow",
              "Microchip Design Process",
              "Issues in Test and Verification of Complex Chips, Embedded Cores and SOCs",
              "Fault Models",
              "Test Coding",
              "ASIC Design Flow",
              "Introduction to ASICs",
              "Introduction to Test Benches",
              "Writing Test Benches in Verilog HDL",
              "Automatic Test Pattern Generation",
              "Design for Testability",
              "Scan Design: Test Interface and Boundary Scan"
            ]
          }
        ]
      },
      {
        code: "EC3551",
        name: "TRANSMISSION LINES AND RF SYSTEMS",
        units: [
          {
            number: 1,
            title: "TRANSMISSION LINE THEORY",
            topics: [
              "General theory of Transmission lines",
              "The transmission line - general solution",
              "The infinite line",
              "Wavelength, velocity of propagation",
              "Waveform distortion",
              "The distortionless line",
              "Loading and different methods of loading",
              "Line not terminated in Z₀",
              "Reflection coefficient",
              "Calculation of current, voltage, power delivered and efficiency of transmission",
              "Input and transfer impedance",
              "Open and short circuited lines",
              "Reflection factor and reflection loss"
            ]
          },
          {
            number: 2,
            title: "HIGH FREQUENCY TRANSMISSION LINES",
            topics: [
              "Transmission line equations at radio frequencies",
              "Line of Zero dissipation",
              "Voltage and current on the dissipationless line",
              "Standing Waves, Nodes, Standing Wave Ratio",
              "Input impedance of the dissipationless line",
              "Open and short circuited lines",
              "Power and impedance measurement on lines",
              "Reflection losses",
              "Measurement of VSWR and wavelength"
            ]
          },
          {
            number: 3,
            title: "IMPEDANCE MATCHING IN HIGH FREQUENCY LINE",
            topics: [
              "Impedance matching: Quarter wave transformer",
              "One Eighth wave line",
              "Half wave line",
              "Impedance matching by stubs",
              "Single stub and double stub matching",
              "Smith chart – Application of Smith chart",
              "Solutions of problems using Smith chart",
              "Single and double stub matching using Smith chart"
            ]
          },
          {
            number: 4,
            title: "WAVEGUIDES",
            topics: [
              "Waves between parallel planes of perfect conductors",
              "Transverse Electric (TE) and Transverse Magnetic (TM) waves",
              "Characteristics of TE and TM waves",
              "Transverse Electromagnetic (TEM) waves",
              "TM and TE waves in Rectangular waveguides",
              "TM and TE waves in Circular waveguides"
            ]
          },
          {
            number: 5,
            title: "RF SYSTEM DESIGN CONCEPTS",
            topics: [
              "Active RF components: Semiconductor basics in RF",
              "Bipolar junction transistors (BJTs)",
              "RF field effect transistors (FETs)",
              "High electron mobility transistors (HEMTs)",
              "Fundamentals of MMIC",
              "Basic concepts of RF design",
              "Filters, couplers, power dividers",
              "Amplifier power relations",
              "Low noise amplifiers (LNAs)",
              "Power amplifiers"
            ]
          }
        ]
      }
    ]
  },
  {
    semester: 6,
    subjects: [
      {
        code: "ET3491",
        name: "EMBEDDED SYSTEMS AND IOT DESIGN",
        units: [
          {
            number: 1,
            title: "8051 MICROCONTROLLER",
            topics: [
              "Microcontrollers for an Embedded System",
              "8051 Architecture",
              "Addressing Modes",
              "Instruction Set",
              "Program and Data Memory",
              "Stacks",
              "Interrupts",
              "Timers/Counters",
              "Serial Ports",
              "Programming"
            ]
          },
          {
            number: 2,
            title: "EMBEDDED SYSTEMS",
            topics: [
              "Embedded System Design Process",
              "Model Train Controller",
              "ARM Processor",
              "Instruction Set Preliminaries",
              "CPU",
              "Programming Input and Output",
              "Supervisor Mode",
              "Exceptions and Trap",
              "Models for Programs – Assembly, Linking and Loading",
              "Compilation Techniques",
              "Program Level Performance Analysis"
            ]
          },
          {
            number: 3,
            title: "PROCESSES AND OPERATING SYSTEMS",
            topics: [
              "Structure of a Real-Time System",
              "Task Assignment and Scheduling",
              "Multiple Tasks and Multiple Processes",
              "Multirate Systems",
              "Preemptive Real-Time Operating Systems",
              "Priority Based Scheduling",
              "Interprocess Communication Mechanisms",
              "Distributed Embedded Systems",
              "MPSoCs and Shared Memory Multiprocessors",
              "Design Examples – Audio Player, Engine Control Unit, Video Accelerator"
            ]
          },
          {
            number: 4,
            title: "IOT ARCHITECTURE AND PROTOCOLS",
            topics: [
              "Internet of Things – Physical Design, Logical Design",
              "IoT Enabling Technologies",
              "Domain Specific IoTs",
              "IoT and M2M",
              "IoT System Management with NETCONF – YANG",
              "IoT Platform Design – Methodology",
              "IoT Reference Model – Domain Model, Communication Model",
              "IoT Reference Architecture",
              "IoT Protocols – MQTT, XMPP, Modbus, CANBUS, BACNet"
            ]
          },
          {
            number: 5,
            title: "IOT SYSTEM DESIGN",
            topics: [
              "Basic Building Blocks of an IoT Device",
              "Raspberry Pi – Board Overview",
              "Linux on Raspberry Pi",
              "Interfaces",
              "Programming with Python",
              "Case Studies: Home Automation, Smart Cities, Environment and Agriculture"
            ]
          }
        ]
      },
      {
        code: "CS3491",
        name: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
        units: [
          {
            number: 1,
            title: "PROBLEM SOLVING",
            topics: [
              "Introduction to AI",
              "AI Applications",
              "Problem solving agents",
              "Search algorithms",
              "Uninformed search strategies",
              "Heuristic search strategies",
              "Local search and optimization problems",
              "Adversarial search",
              "Constraint satisfaction problems (CSP)"
            ]
          },
          {
            number: 2,
            title: "PROBABILISTIC REASONING",
            topics: [
              "Acting under uncertainty",
              "Bayesian inference",
              "Naïve Bayes models",
              "Probabilistic reasoning",
              "Bayesian networks",
              "Exact inference in Bayesian networks",
              "Approximate inference in Bayesian networks",
              "Causal networks"
            ]
          },
          {
            number: 3,
            title: "SUPERVISED LEARNING",
            topics: [
              "Introduction to machine learning",
              "Linear Regression Models: Least squares (single & multiple variables), Bayesian linear regression, gradient descent",
              "Linear Classification Models: Discriminant function",
              "Probabilistic discriminative model – Logistic regression",
              "Probabilistic generative model – Naive Bayes",
              "Maximum margin classifier – Support Vector Machine (SVM)",
              "Decision Tree",
              "Random Forests"
            ]
          },
          {
            number: 4,
            title: "ENSEMBLE TECHNIQUES AND UNSUPERVISED LEARNING",
            topics: [
              "Combining multiple learners: Model combination schemes, Voting",
              "Ensemble Learning – Bagging, Boosting, Stacking",
              "Unsupervised learning: K-means",
              "Instance Based Learning: KNN",
              "Gaussian Mixture Models",
              "Expectation Maximization"
            ]
          },
          {
            number: 5,
            title: "NEURAL NETWORKS",
            topics: [
              "Perceptron",
              "Multilayer Perceptron",
              "Activation Functions",
              "Network training – Gradient Descent Optimization",
              "Stochastic Gradient Descent",
              "Error Backpropagation",
              "From shallow to deep networks",
              "Unit saturation (vanishing gradient problem)",
              "ReLU",
              "Hyperparameter tuning",
              "Batch Normalization",
              "Regularization",
              "Dropout"
            ]
          }
        ]
      }
    ]
  },
  {
    semester: 7,
    subjects: [
      {
        code: "GE3791",
        name: "HUMAN VALUES AND ETHICS",
        units: [
          {
            number: 1,
            title: "DEMOCRATIC VALUES",
            topics: [
              "Understanding Democratic values: Equality, Liberty, Fraternity, Freedom, Justice, Pluralism, Tolerance, Respect for All, Freedom of Expression",
              "Citizen Participation in Governance",
              "World Democracies: French Revolution, American Independence, Indian Freedom Movement"
            ]
          },
          {
            number: 2,
            title: "SECULAR VALUES",
            topics: [
              "Understanding Secular values",
              "Interpretation of secularism in Indian context",
              "Disassociation of state from religion",
              "Acceptance of all faiths",
              "Encouraging non-discriminatory practices"
            ]
          },
          {
            number: 3,
            title: "SCIENTIFIC VALUES",
            topics: [
              "Scientific thinking and method: Inductive and Deductive thinking",
              "Proposing and testing Hypothesis",
              "Validating facts using evidence-based approach",
              "Skepticism and Empiricism",
              "Rationalism and Scientific Temper"
            ]
          },
          {
            number: 4,
            title: "SOCIAL ETHICS",
            topics: [
              "Application of ethical reasoning to social problems",
              "Gender bias and issues",
              "Gender violence",
              "Social discrimination",
              "Constitutional protection and policies",
              "Inclusive practices"
            ]
          },
          {
            number: 5,
            title: "SCIENTIFIC ETHICS",
            topics: [
              "Transparency and Fairness in scientific pursuits",
              "Scientific inventions for the betterment of society",
              "Unfair application of scientific inventions",
              "Role and Responsibility of Scientist in the modern society"
            ]
          }
        ]
      }
    ]
  }
];

// Route to get all semesters
syllabusRouter.get("/", (_req: Request, res: Response) => {
  const semesters = syllabusData.map(sem => ({
    semester: sem.semester,
    subjectCount: sem.subjects.length
  }));
  res.json(semesters);
});

// Route to get subjects by semester
syllabusRouter.get("/semester/:semester", (req: Request, res: Response) => {
  const { semester } = req.params;
  const semesterData = syllabusData.find(sem => sem.semester.toString() === semester);
  
  if (!semesterData) {
    return res.status(404).json({ message: "Semester not found" });
  }
  
  res.json(semesterData.subjects.map(subject => ({
    code: subject.code,
    name: subject.name
  })));
});

// Route to get units by subject
syllabusRouter.get("/subject/:code", (req: Request, res: Response) => {
  const { code } = req.params;
  let subject = null;
  
  // Find the subject
  for (const semester of syllabusData) {
    const found = semester.subjects.find(sub => sub.code === code);
    if (found) {
      subject = found;
      break;
    }
  }
  
  if (!subject) {
    return res.status(404).json({ message: "Subject not found" });
  }
  
  res.json(subject.units.map(unit => ({
    number: unit.number,
    title: unit.title
  })));
});

// Route to get topics by unit
syllabusRouter.get("/unit/:code/:unit", (req: Request, res: Response) => {
  const { code, unit } = req.params;
  let selectedUnit = null;
  
  // Find the subject
  for (const semester of syllabusData) {
    const subject = semester.subjects.find(sub => sub.code === code);
    if (subject) {
      selectedUnit = subject.units.find(u => u.number.toString() === unit);
      if (selectedUnit) break;
    }
  }
  
  if (!selectedUnit) {
    return res.status(404).json({ message: "Unit not found" });
  }
  
  res.json({
    title: selectedUnit.title,
    topics: selectedUnit.topics
  });
});

// Route to get content for a specific topic
syllabusRouter.get("/topic/:code/:unit/:topic", async (req: Request, res: Response) => {
  // Temporarily disable authentication check for testing
  // if (!req.isAuthenticated()) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  
  try {
    const { code, unit, topic } = req.params;
    
    // Find the subject and unit
    let subjectName = "";
    let unitTitle = "";
    let topicName = "";
    
    for (const semester of syllabusData) {
      const subject = semester.subjects.find(sub => sub.code === code);
      if (subject) {
        subjectName = subject.name;
        const selectedUnit = subject.units.find(u => u.number.toString() === unit);
        if (selectedUnit) {
          unitTitle = selectedUnit.title;
          // Convert the index to a topic name (topics are 0-indexed in arrays)
          const topicIndex = parseInt(topic);
          if (!isNaN(topicIndex) && topicIndex >= 0 && topicIndex < selectedUnit.topics.length) {
            topicName = selectedUnit.topics[topicIndex];
          }
          break;
        }
      }
    }
    
    if (!topicName) {
      return res.status(404).json({ message: "Topic not found" });
    }
    
    console.log(`Generating content for ${subjectName}, Unit ${unit}: ${unitTitle}, Topic: ${topicName}`);
    
    // Generate content using Gemini AI
    const geminiModel = genAI.getGenerativeModel(geminiConfig);
    
    const prompt = `
    Provide a comprehensive educational explanation about the following topic from the Anna University ECE syllabus:
    
    Subject: ${subjectName}
    Unit ${unit}: ${unitTitle}
    Topic: ${topicName}
    
    Structure your response using clean HTML formatting with these sections:
    <section class="detailed-explanation">
      <h3>Detailed Explanation</h3>
      <div class="simple-terms">
        <h4>Simple Terms</h4>
        <p>Begin with a simple, accessible explanation of the topic that a beginner could understand. Use clear analogies when possible.</p>
      </div>
      <div class="technical-depth">
        <h4>Technical Depth</h4>
        <p>Follow with a more detailed technical explanation with proper terminology and concepts. figure out all the relevant concepts. explain there is any types, important function or concept atlreast for 1000 words, </p>
      </div>
      <div class="methodology">
        <h4>Methodology & Working Principles</h4>
        <p>Explain how this concept is applied, any types/classifications, and the underlying principles.</p>
      </div>
      <div class="summary">
        <h4>Concise Summary</h4>
        <p>Provide a 1-2 sentence summary of the key takeaway.</p>
      </div>
    </section>
    <section class="key-formulas">
      <h3>Key Formulas</h3>
      <div class="formula">
        <div class="formula-expression">V = I × R</div>
        <div class="variables">
          <ul>
            <li><span class="variable">V</span>: Voltage (Volts)</li>
            <li><span class="variable">I</span>: Current (Amperes)</li>
            <li><span class="variable">R</span>: Resistance (Ohms)</li>
          </ul>
        </div>
      </div>
      <div class="formula">
        <div class="formula-expression"><strong>R = V / R</strong></div>
        <div class="variables">
          <ul>
            <li><span class="variable">V</span>: Voltage (Volts)</li>
            <li><span class="variable">I</span>: Current (Amperes)</li>
            <li><span class="variable">R</span>: Resistance (Ohms)</li>
          </ul>
        </div>
      </div>
      <div class="application">
        <h4>How to Apply:</h4>
        <ol>
          <li>Step 1 of application</li>
          <li>Step 2 of application</li>
        </ol>
      </div>
    </section>
    <section class="visuals">
      <h3>Visuals & Diagrams</h3>
      <div class="diagram">
        <h4>Diagram 1</h4>
        <p>Detailed description of what the diagram should show - include circuit layouts, graphs, or process flows.</p>
      </div>
      <div class="diagram">
        <h4>Diagram 2</h4>
        <p>Another diagram description if needed</p>
      </div>
    </section>
    <section class="references">
      <h3>IEEE Paper References</h3>
      <ul>
        <li>Reference 1: Author, Title, Journal/Conference, Year</li>
        <li>Reference 2: Author, Title, Journal/Conference, Year</li>
        <li>Reference 3: Author, Title, Journal/Conference, Year (if applicable)</li>
      </ul>
    </section>
    <section class="prerequisites">
      <h3>Prerequisite & Related Topics</h3>
      <div class="prereq-list">
        <h4>Prerequisites:</h4>
        <ul>
          <li>Prerequisite 1</li>
          <li>Prerequisite 2</li>
        </ul>
      </div>
      
      <div class="related-list">
        <h4>Related Topics within ECE Syllabus:</h4>
        <ul>
          <li>Related topic 1</li>
          <li>Related topic 2</li>
          <li>Related topic 3</li>
        </ul>
      </div>
    </section>

    IMPORTANT FORMATTING GUIDELINES:
    1. For ALL mathematical formulas, use the MathJax syntax: V = I × R, NO $$ or \\(\\) or \[ \] or \begin{equation} \end{equation}
    2. Use proper mathematical symbols: × for multiplication, π for pi, etc.
    3. For subscripts use <sub>text</sub>, for superscripts use <sup>text</sup>
    4. Always use professional HTML formatting with proper spacing and organization
    5. Ensure all content is technically accurate and at an appropriate level for engineering students
    6. Never use Markdown formatting (like ** for bold) - use proper HTML tags instead
    
    Be accurate and comprehensive. This will be used for students' exam preparation in electronics and communication engineering.
    `;
    
    const result = await geminiModel.generateContent(prompt);
    const content = result.response.text();
    
    // Add user activity if authenticated
    if (req.user?.id) {
      await storage.createUserActivity({
        userId: req.user.id,
        activityType: "SYLLABUS_NAVIGATOR",
        description: `Explored ${subjectName} - ${topicName}`
      });
    }
    
    res.json({ 
      subject: subjectName,
      unit: unitTitle,
      topic: topicName,
      content
    });
  } catch (error) {
    console.error("Error generating topic content:", error);
    res.status(500).json({ message: "Error generating topic content" });
  }
});

// Mark a topic as completed
syllabusRouter.post("/progress", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const { code, unit, topic } = req.body;
    
    if (!code || !unit || topic === undefined) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    
    // For a real implementation, we would store this in the database
    // For now, just acknowledge the request
    
    // Add user activity
    await storage.createUserActivity({
      userId: req.user.id,
      activityType: "TOPIC_COMPLETED",
      description: `Completed ${code} - Unit ${unit} - Topic ${topic}`
    });
    
    res.json({ message: "Progress saved successfully" });
  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({ message: "Error saving progress" });
  }
});

export default syllabusRouter;