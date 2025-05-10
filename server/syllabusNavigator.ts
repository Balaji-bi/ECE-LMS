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
        <p>Follow with a more rigorous technical explanation with proper terminology and concepts.</p>
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
        <div class="formula-expression">I = V / R</div>
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
    1. For ALL mathematical formulas, use the MathJax syntax: $V = I × R$ for inline formulas or $$V = I × R$$ for block formulas
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