# Referencias

Todas las afirmaciones cuantitativas del proyecto proceden de estas fuentes. Cuando un dato aparece en el pitch, en la app o en la documentación, está aquí.

---

## Epidemiología y salud pública

**Bray F, Laversanne M, Sung H, et al.** Global cancer statistics 2022: GLOBOCAN estimates of incidence and mortality worldwide for 36 cancers in 185 countries. *CA Cancer J Clin*. 2024. — 2 296 840 casos nuevos y 666 103 muertes por cáncer de mama en 2022.

**Global burden and trends of breast cancer: GLOBOCAN 2022 estimates of incidence and mortality in 185 countries.** *Chin Med J*. 2025. doi:10.1097/CM9.0000000000003921 — 23.8 % de todos los cánceres en mujeres y 15.4 % de las muertes; proyección de 3.55 millones de casos y 1.14 millones de muertes para 2050.

**Organización Mundial de la Salud.** Global Breast Cancer Initiative Implementation Framework. 2023. — Meta de reducción de mortalidad de 2.5 % anual para evitar 2.5 millones de muertes entre 2020 y 2040. Pilar 1: al menos 60 % de los cánceres invasivos diagnosticados en estadio I o II. Diagnóstico en 60 días; tratamiento completo en al menos 80 % de las pacientes. Cerca del 80 % de las muertes por cáncer de mama y cervical ocurre en países de ingreso bajo y medio.

**Consenso Mexicano sobre diagnóstico y tratamiento del cáncer mamario.** Colima, 2021. — 55.9 % diagnosticado en etapas localmente avanzadas (IIb–III) y 10.5 % en etapa metastásica.

**Instituto Nacional de Cancerología (México).** Tumores de mama. — Más del 60 % de los casos en México se diagnostica en etapas avanzadas.

---

## Puntajes poligénicos

**Mavaddat N, Michailidou K, Dennis J, et al.** Polygenic Risk Scores for Prediction of Breast Cancer and Breast Cancer Subtypes. *Am J Hum Genet*. 2019;104(1):21-34. — PRS313: OR por desviación estándar de 1.61 (IC 95 % 1.57–1.65), AUC 0.630. Riesgo a lo largo de la vida de 32.6 % en el centil superior. Archivo de puntuación disponible como `PGS000004` en el PGS Catalog.

**Lambert SA, Gil L, Jupp S, et al.** The Polygenic Score Catalog as an open database for reproducibility and systematic evaluation. *Nat Genet*. 2021. — Formato de archivos de puntuación usado por el motor de este proyecto.

**Martin AR, Kanai M, Kamatani Y, et al.** Clinical use of current polygenic risk scores may exacerbate health disparities. *Nat Genet*. 2019;51:584-591. — 79 % de los participantes en GWAS son de ascendencia europea frente a un 16 % de la población mundial. Precisión reducida aproximadamente 4.5 veces en ascendencia africana, 2 veces en asiática oriental y 1.6 veces en hispana o latina. Al recalcular con BioBank Japan, la precisión para asiáticos orientales mejoró cerca de 50 %.

**Generalizability of PGS313 for breast cancer risk in a Los Angeles biobank.** *HGG Advances*. 2024. — AUC 0.70 en ascendencia europea, 0.68 en latina, 0.64 en asiática oriental y 0.61 en africana.

**Du Z, Gao G, Adedokun B, et al.** Evaluating Polygenic Risk Scores for Breast Cancer in Women of African Ancestry. *J Natl Cancer Inst*. 2021. — OR por desviación estándar de 1.27 y AUC 0.571 para PRS313 en mujeres de ascendencia africana.

### Variantes del panel demostrativo

**Easton DF, Pooley KA, Dunning AM, et al.** Genome-wide association study identifies novel breast cancer susceptibility loci. *Nature*. 2007;447:1087-1093. — rs2981582, rs3803662, rs889312, rs13281615, rs3817198.

**Stacey SN, Manolescu A, Sulem P, et al.** Common variants on chromosomes 2q35 and 16q12 confer susceptibility to estrogen receptor-positive breast cancer. *Nat Genet*. 2007. — rs13387042.

**Cox A, Dunning AM, Garcia-Closas M, et al.** A common coding variant in CASP8 is associated with breast cancer risk. *Nat Genet*. 2007. — rs1045485.

**Stacey SN, Manolescu A, Sulem P, et al.** Common variants on chromosome 5p12 confer susceptibility to estrogen receptor-positive breast cancer. *Nat Genet*. 2008. — rs10941679.

**Ahmed S, Thomas G, Ghoussaini M, et al.** Newly discovered breast cancer susceptibility loci on 3p24 and 17q23.2. *Nat Genet*. 2009. — rs4973768.

**Zheng W, Long J, Gao YT, et al.** Genome-wide association study identifies a new breast cancer susceptibility locus at 6q25.1. *Nat Genet*. 2009. — rs2046210.

**Thomas G, Jacobs KB, Kraft P, et al.** A multistage genome-wide association study in breast cancer identifies two new risk alleles at 1p11.2 and 14q24.1. *Nat Genet*. 2009. — rs11249433.

**Turnbull C, Ahmed S, Morrison J, et al.** Genome-wide association study identifies five new breast cancer susceptibility loci. *Nat Genet*. 2010. — rs614367, rs704010, rs1011970, rs10995190.

> Los odds ratios usados en `data/panel-demo.txt` son los reportados en estas publicaciones de descubrimiento, redondeados a dos decimales, con la cita en cada línea del archivo. El panel es demostrativo, no un puntaje validado.

---

## Clasificadores multigénicos y subtipos moleculares

**Brueffer C, Vallon-Christersson J, Grabau D, et al.** Clinical Value of RNA Sequencing-Based Classifiers for Prediction of the Five Conventional Breast Cancer Biomarkers: A Report From the Population-Based Multicenter Sweden Cancerome Analysis Network—Breast Initiative. *JCO Precis Oncol*. 2018. — Base conceptual del clasificador multigénico. Cohorte SCAN-B.

**Staaf J, Häkkinen J, Hegardt C, et al.** RNA sequencing-based single sample predictors of molecular subtype and risk of recurrence for clinical assessment of early-stage breast cancer. *npj Breast Cancer*. 2022;8:94. — Concordancia con estado clinicopatológico: ER 96 % (κ = 0.86), PR 87 % (κ = 0.70), HER2 92 % con modelos específicos de ER, Ki67 80 %, grado histológico 57 %.

**SCAN-B.** Series `GSE81538` y `GSE96058`, Gene Expression Omnibus. — Cohorte de referencia.

---

## Aprendizaje federado y privacidad diferencial

**McMahan HB, Moore E, Ramage D, et al.** Communication-Efficient Learning of Deep Networks from Decentralized Data. *AISTATS*. 2017. — Algoritmo FedAvg.

**Sheller MJ, Edwards B, Reina GA, et al.** Federated learning in medicine: facilitating multi-institutional collaborations without sharing patient data. *Sci Rep*. 2020;10:12598. — Modelo federado sobre 10 instituciones alcanzó el 99 % del desempeño del modelo centralizado, superando a otros métodos colaborativos que preservan privacidad.

**Sheller MJ, Reina GA, Edwards B, et al.** Multi-Institutional Deep Learning Modeling Without Sharing Patient Data: A Feasibility Study on Brain Tumor Segmentation. *MICCAI BrainLes*. 2018. — Dice 0.852 federado contra 0.862 centralizado.

**Adnan M, Kalra S, Cresswell JC, et al.** Federated learning and differential privacy for medical image analysis. *Sci Rep*. 2022;12:1953. — FedAvg con privacidad diferencial sobre TCGA: desempeño comparable al centralizado con ε = 2.90 y δ = 1e-4.

**Dayan I, Roth HR, Zhong A, et al.** Federated learning for predicting clinical outcomes in patients with COVID-19. *Nat Med*. 2021;27:1735-1743.

**Abadi M, Chu A, Goodfellow I, et al.** Deep Learning with Differential Privacy. *ACM CCS*. 2016. — DP-SGD, recorte por ejemplo y accountant de momentos.

**Dwork C, Roth A.** The Algorithmic Foundations of Differential Privacy. *Found Trends Theor Comput Sci*. 2014. — Mecanismo gaussiano, teorema A.1, usado en la contabilidad de este proyecto.

**Kaissis GA, Makowski MR, Rückert D, Braren RF.** Secure, privacy-preserving and federated machine learning in medical imaging. *Nat Mach Intell*. 2020;2:305-311.

---

## Criptografía aplicada a datos genómicos

**Paillier P.** Public-Key Cryptosystems Based on Composite Degree Residuosity Classes. *EUROCRYPT*. 1999. — Esquema aditivamente homomórfico implementado en `src/paillier.js`.

**Kuo TT, Jiang X, Tang H, et al.** iDASH secure genome analysis competition 2018: blockchain genomic data access logging, homomorphic encryption on GWAS, and DNA segment searching. *BMC Med Genomics*. 2020;13(Suppl 7):98. — Cómputo seguro sobre 15 000 SNP en menos de dos minutos, rompiendo el récord anterior de aproximadamente diez minutos por SNP.

**Blatt M, Gusev A, Polyakov Y, et al.** Optimized homomorphic encryption solution for secure genome-wide association studies. *BMC Med Genomics*. 2020. — GWAS completo para 1 000 individuos, 131 071 SNP y 3 covariables en unos diez minutos sobre un nodo de 28 núcleos. Las soluciones de Duality y UCSD completaron GWAS para 1 000 individuos en aproximadamente cuatro y dos minutos.

**Kim M, Song Y, Li B, Micciancio D.** Semi-Parallel Logistic Regression for GWAS on Encrypted Data. *BMC Med Genomics*. 2020. — 245 muestras, 10 643 SNP y 3 covariables en unos 43 segundos bajo cifrado.

**Cheon JH, Kim A, Kim M, Song Y.** Homomorphic Encryption for Arithmetic of Approximate Numbers (CKKS). *ASIACRYPT*. 2017.

**NIST SP 800-38D.** Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC. — Modo usado en la bóveda local.

**OWASP.** Password Storage Cheat Sheet. — 600 000 iteraciones como mínimo vigente para PBKDF2-HMAC-SHA-256.

---

## Privacidad genómica, regulación y ética

**Gymrek M, McGuire AL, Golan D, Halperin E, Erlich Y.** Identifying personal genomes by surname inference. *Science*. 2013;339(6117):321-324. doi:10.1126/science.1229566 — Recuperación de apellidos desde genomas sin identificadores usando repeticiones cortas en tándem del cromosoma Y y bases de genealogía recreativa públicas y gratuitas.

**23andMe Holding Co.**, Capítulo 11, marzo de 2025. Venta aprobada por el tribunal de quiebras y cerrada el 14 de julio de 2025: TTAM Research Institute adquirió los activos por 305 millones de dólares, por encima de la oferta de 256 millones de Regeneron. Filtración previa que afectó a 6.9 millones de clientes. Alrededor de 1.9 millones de consumidores borraron sus datos durante el proceso. California, Kentucky, Tennessee, Texas y Utah se mantuvieron opuestos a la venta. Compromisos de TTAM: consejo asesor de privacidad del consumidor a 90 días, informes anuales de privacidad a los fiscales generales estatales, y restricción de transferencia de datos genéticos en quiebras posteriores.

**Genetic Information Nondiscrimination Act (GINA)**, EE. UU., 2008. — Protege frente a discriminación en seguro de salud y empleo. **No cubre** seguros de vida, de discapacidad ni de cuidados de largo plazo, ni empleadores de menos de 15 personas (American Society of Human Genetics; U.S. Department of Health and Human Services, OHRP).

**Ley Federal de Protección de Datos Personales en Posesión de los Particulares.** México. Publicada en el Diario Oficial de la Federación el 20 de marzo de 2025, vigente desde el 21 de marzo de 2025. Artículo 2, fracción VI: la información genética se considera dato personal sensible. Extinción del INAI; la autoridad pasa a la Secretaría Anticorrupción y Buen Gobierno.

**Reglamento General de Protección de Datos (GDPR)**, artículo 9. — Los datos genéticos son categoría especial de datos personales.

**UNESCO.** Declaración Universal sobre el Genoma Humano y los Derechos Humanos, 1997. Declaración Internacional sobre los Datos Genéticos Humanos, 2003.

**Global Alliance for Genomics and Health (GA4GH).** Framework for Responsible Sharing of Genomic and Health-Related Data; Data Security Toolkit.

**IBM Security.** Cost of a Data Breach Report 2025. — Salud es el sector más caro por decimocuarto año consecutivo: 7.42 millones de dólares por incidente frente a un promedio global de 4.44 millones, y 279 días promedio para identificar y contener.

---

## Panorama competitivo

**Myriad Genetics.** MyRisk Hereditary Cancer Test con RiskScore. Panel de 48 genes; PRS validado para todas las ascendencias combinado con el modelo Tyrer-Cuzick. Validación longitudinal en más de 130 000 mujeres (Mabey et al., *Am J Hum Genet*); duplica la capacidad predictiva de Tyrer-Cuzick solo. Estudio de manejo clínico publicado en *JCO Precision Oncology*, 2025.

**Lifebit Biotech.** Plataforma federada de datos genómicos. Despliegues documentados con Genomics England, los NIH y el Ministerio de Salud de Singapur. El cómputo viaja al dato; despliegue en la nube del propio cliente.

**Apheris AI.** Cómputo federado para descubrimiento de fármacos; despliegue local para preservar soberanía sobre IP sensible; integración con cifrado homomórfico, privacidad diferencial y datos sintéticos.

**Owkin, Rhino Health, NVIDIA FLARE, Intel OpenFL, Flower.** Infraestructura de aprendizaje federado en salud.
