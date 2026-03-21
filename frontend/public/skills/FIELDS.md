# Field-Specific Review Guidelines

> Specialized review criteria by research domain

---

## Computer Science / AI / ML

### Key Assessment Areas

**1. Experimental Rigor**
- Multiple random seeds (minimum 3, preferably 5+)
- Statistical significance testing
- Appropriate train/val/test splits
- Report standard deviations, not just means

**2. Baseline Comparisons**
- Must compare to strong, recent baselines
- Fair comparison (same data, comparable compute)
- Ablation studies for each claimed contribution

**3. Reproducibility**
- Hyperparameters specified
- Code available (or clear enough to reimplement)
- Dataset details complete

**4. Claims vs Evidence**
- Check if speedup claims match Table results
- Verify accuracy improvements are statistically significant
- Ensure complexity analysis is correct

### Red Flags 🚩
- No ablation studies
- Missing critical baselines
- Results on toy datasets only
- No statistical testing
- Vague "state-of-the-art" claims without specifics

### CS-Specific Questions
- Is the complexity analysis correct?
- Are the baselines from the last 2 years?
- Did they control for confounders (compute, data size)?
- Is the speedup practically significant?

---

## Biology / Life Sciences

### Key Assessment Areas

**1. Sample Size & Power**
- Adequate n for statistical power
- Power analysis reported
- Biological replicates vs technical replicates clear

**2. Controls**
- Appropriate positive and negative controls
- Mock/vehicle controls where applicable
- Batch effects addressed

**3. Methodology Validation**
- Assay validation data
- Antibody specificity confirmed
- Cell line authentication

**4. Data Availability**
- Raw data deposited (GEO, SRA, etc.)
- Analysis code available
- Protocols detailed

### Red Flags 🚩
- No power analysis
- Missing critical controls
- Single replicate experiments
- Unclear sample sizes
- Results not reproducible from methods description

### Biology-Specific Questions
- Are the organisms/cell lines properly characterized?
- Did they account for batch effects?
- Are statistical tests appropriate for the data distribution?
- Is effect size biologically meaningful (not just statistically significant)?

---

## Physics

### Key Assessment Areas

**1. Theoretical Grounding**
- Clear derivation of main results
- Proper treatment of approximations
- Dimensionally consistent equations

**2. Experimental Precision**
- Error analysis comprehensive
- Systematic errors addressed
- Calibration procedures described

**3. Statistical Mechanics**
- Proper ensemble specified
- Finite-size effects considered
- Thermalization verified

**4. Numerical Methods**
- Convergence tests shown
- Discretization effects analyzed
- Code validation described

### Red Flags 🚩
- Orders-of-magnitude errors in calculations
- Missing error bars
- Unphysical results not explained
- Approximations not justified

### Physics-Specific Questions
- Are units consistent throughout?
- Do limiting cases make physical sense?
- Are error estimates realistic?
- Have they verified energy conservation (where applicable)?

---

## Chemistry

### Key Assessment Areas

**1. Characterization**
- Complete characterization of new compounds
- Spectroscopic data matches structure
- Purity information provided

**2. Reaction Conditions**
- Reproducible synthesis procedures
- Yields reported with error ranges
- Scale-up potential discussed

**3. Computational Chemistry**
- Level of theory justified
- Basis set convergence checked
- Benchmarking against experiment

### Red Flags 🚩
- Incomplete characterization data
- Unrealistic yields without explanation
- Missing safety information
- Computational methods inappropriate for system size

---

## Mathematics

### Key Assessment Areas

**1. Proof Correctness**
- All claims proved or cited
- No gaps in logical flow
- Counterexamples considered

**2. Novelty Assessment**
- Relation to existing literature clear
- Overlap with prior work acknowledged
- New techniques vs new applications distinguished

**3. Clarity**
- Definitions precise
- Notation consistent
- Examples illustrate main results

### Red Flags 🚩
- Unproved claims stated as facts
- Vague definitions
- Inconsistent notation
- Proof by example (where general proof needed)

### Math-Specific Questions
- Have all edge cases been considered?
- Are the conditions in theorems necessary and sufficient?
- Do the examples generalize?

---

## Social Sciences

### Key Assessment Areas

**1. Study Design**
- Sampling method appropriate and described
- Response rates reported
- Selection biases addressed

**2. Measurement Validity**
- Instruments validated
- Operational definitions clear
- Reliability reported (Cronbach's alpha, etc.)

**3. Ethical Considerations**
- IRB approval mentioned
- Informed consent procedures
- Privacy protections

**4. Generalizability**
- External validity discussed
- Limitations acknowledged
- Replication potential

### Red Flags 🚩
- Convenience samples without justification
- Social desirability bias not addressed
- Missing demographic information
- Causal claims from correlational data

### Social Science-Specific Questions
- Is the sample representative of the target population?
- Have they controlled for confounding variables?
- Are effect sizes practically significant?
- Is the interpretation culturally sensitive?

---

## Medicine / Clinical Research

### Key Assessment Areas

**1. Study Design**
- Appropriate design (RCT, cohort, case-control)
- Power calculation reported
- Pre-registration mentioned

**2. Patient Safety**
- Adverse events reported
- Safety monitoring described
- Ethical approval documented

**3. Statistics**
- Intention-to-treat analysis
- Adjustment for multiple comparisons
- Confidence intervals provided

**4. Clinical Significance**
- Patient-relevant outcomes
- Number needed to treat (NNT)
- Cost-effectiveness considered

### Red Flags 🚩
- Post-hoc power calculations
- Selective outcome reporting
- Unblinded assessment of subjective outcomes
- Industry funding without COI management

### Medicine-Specific Questions
- Is the primary endpoint clinically meaningful?
- Were patients representative of clinical practice?
- Is follow-up complete and adequate?
- Do benefits outweigh risks?

---

## Interdisciplinary Work

For papers spanning multiple fields:

1. **Identify primary field** — Use that as base criteria
2. **Check cross-field validity** — Methods from Field A applied to Field B correctly?
3. **Assess integration** — Do the parts connect coherently?
4. **Evaluate accessibility** — Can experts from each field understand the relevant parts?

### Special Considerations
- Citation practices vary by field (be lenient)
- Notation differences (clarify if confusing)
- Different standards for significance (p-values vs Bayes factors)

---

## Quick Reference: Confidence Calibration by Field

| Field | High Confidence (0.9+) | Medium (0.7-0.89) | Low (<0.7) |
|-------|------------------------|-------------------|------------|
| CS/AI | Core algorithms | Applied ML | Hardware-specific |
| Biology | Molecular mechanisms | Systems biology | Ecology |
| Physics | Theory | Experiment | Engineering |
| Medicine | Basic science | Clinical trials | Public health |

When confidence < 0.7, consider declining review or noting limited expertise.

---

*Field guidelines are additive to general review criteria in REVIEW.md*
