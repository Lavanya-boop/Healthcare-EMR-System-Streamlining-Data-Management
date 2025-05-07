// Import required modules
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static HTML files
app.use(express.static(path.join(__dirname)));

// MySQL Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'root', // Replace with your MySQL password
  database: 'electronic_health_records', // Replace with your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Routes

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Handle Appointment Booking
app.post('/submitAppointment', (req, res) => {
    const { patient_name, patient_email, doctor_name, appointment_date, appointment_time } = req.body;

    // Insert the appointment details into the appointments table
    const query = `
    INSERT INTO appointments 
    (patient_name, patient_email, doctor_name, appointment_date, appointment_time)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(
        query,
        [patient_name, patient_email, doctor_name, appointment_date, appointment_time],
        (err) => {
            if (err) {
                console.error('Error booking appointment:', err);
                res.status(500).send('Error booking appointment.');
            } else {
                res.send('Appointment booked successfully!');
            }
        }
    );
});

app.get('/checkAvailability', (req, res) => {
    const { doctor, date } = req.query;

    const availableSlots = [
        "09:00", "10:00", "11:00", "12:00",
        "14:00", "15:00", "16:00"
    ];

    // Query to get the booked slots for a doctor on a specific date
    const query = `
    SELECT appointment_time FROM appointments
    WHERE doctor_name = ? AND appointment_date = ?
  `;

    db.query(query, [doctor, date], (err, results) => {
        if (err) {
            console.error('Error checking availability:', err);
            res.status(500).send('Error checking availability.');
        } else {
            const bookedSlots = results.map(row => row.appointment_time);
            const freeSlots = availableSlots.filter(slot => !bookedSlots.includes(slot));

            res.json({ availableSlots: freeSlots });
        }
    });
});


// Handle Patient Registration
app.post('/submit-patient', (req, res) => {
  const {
    patientId,
    firstName,
    lastName,
    dob,
    gender,
    email,
    phone,
    address,
    medicalHistory,
    allergies,
    aadharNumber,
    emergencyContact,
    emergencyPhone,
    maritalStatus,
    occupation,
  } = req.body;

  const query = `
    INSERT INTO patients 
    (patient_id, first_name, last_name, dob, gender, email, phone, address, medical_history, allergies, aadhar_number, emergency_contact, emergency_phone, marital_status, occupation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [patientId, firstName, lastName, dob, gender, email, phone, address, medicalHistory, allergies, aadharNumber, emergencyContact, emergencyPhone, maritalStatus, occupation],
    (err) => {
      if (err) {
        console.error('Error inserting patient:', err);
        res.status(500).send('Error registering patient.');
      } else {
        res.send('Patient registered successfully.');
      }
    }
  );
});

// Handle Medical History Submission
app.post('/submit-medical-history', (req, res) => {
    const {
        patientId,
        patientName,
        chronicIllnesses,
        surgeries,
        currentMedications,
        allergies,
        hospitalizations,
        familyHistory,
        immunizations,
        socialHistory,
        otherConditions
    } = req.body;

    const query = `
    INSERT INTO medical_history 
    (patient_id, patient_name, chronic_illnesses, surgeries, current_medications, allergies, hospitalizations, family_history, immunizations, social_history, other_conditions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
        query,
        [patientId, patientName, chronicIllnesses, surgeries, currentMedications, allergies, hospitalizations, familyHistory, immunizations, socialHistory, otherConditions],
        (err) => {
            if (err) {
                console.error('Error inserting medical history:', err);
                res.status(500).send('Error submitting medical history.');
            } else {
                res.send('Medical history submitted successfully.');
            }
        }
    );
});

// Handle Laboratory Findings Submission
app.post('/submit-lab-report', (req, res) => {
  const { patientId, patientName, date, physician, hemoglobin, rbc, wbc, platelets, glucose, urea, creatinine, cholesterol, microbiologyFindings, xray, ctScan, mri, ultrasound, otherTests } = req.body;

  const query = `
    INSERT INTO lab_reports 
    (patient_id, patient_name, test_date, physician, hemoglobin, rbc, wbc, platelets, glucose, urea, creatinine, cholesterol, microbiology_findings, xray, ct_scan, mri, ultrasound, other_tests)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [patientId, patientName, date, physician, hemoglobin, rbc, wbc, platelets, glucose, urea, creatinine, cholesterol, microbiologyFindings, xray, ctScan, mri, ultrasound, otherTests],
    (err) => {
      if (err) {
        console.error('Error inserting lab report:', err);
        res.status(500).send('Error submitting lab report.');
      } else {
        res.send('Lab report submitted successfully.');
      }
    }
  );
});

// Handle Diagnosis Submission
app.post('/submit-diagnosis', (req, res) => {
  const { patientId, patientName, date, symptoms, observations, provisionalDiagnosis, tests, finalDiagnosis, treatmentPlan, followUp } = req.body;

  const query = `
    INSERT INTO diagnosis 
    (patient_id, patient_name, diagnosis_date, symptoms, observations, provisional_diagnosis, tests, final_diagnosis, treatment_plan, follow_up)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [patientId, patientName, date, symptoms, observations, provisionalDiagnosis, tests, finalDiagnosis, treatmentPlan, followUp],
    (err) => {
      if (err) {
        console.error('Error inserting diagnosis:', err);
        res.status(500).send('Error submitting diagnosis.');
      } else {
        res.send('Diagnosis submitted successfully.');
      }
    }
  );
});

// Handle Treatment Submission
app.post('/submit-treatment', (req, res) => {
  const { patientId, patientName, date, diagnosis, medications, procedures, therapyPlan, diet, lifestyle, followUp, additionalNotes } = req.body;

  const query = `
    INSERT INTO treatment 
    (patient_id, patient_name, treatment_date, diagnosis, medications, procedures, therapy_plan, diet, lifestyle, follow_up, additional_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [patientId, patientName, date, diagnosis, medications, procedures, therapyPlan, diet, lifestyle, followUp, additionalNotes],
    (err) => {
      if (err) {
        console.error('Error inserting treatment:', err);
        res.status(500).send('Error submitting treatment.');
      } else {
        res.send('Treatment submitted successfully.');
      }
    }
  );
});

// Handle Patient Search
app.post('/search-patient', (req, res) => {
  const { searchPatientId } = req.body;

  const query = `
    SELECT
  patients.patient_id,
  patients.first_name,
  patients.last_name,
  patients.dob,
  patients.gender,
  patients.email,
  patients.phone,
  patients.address,
  patients.medical_history AS patient_medical_history,
  patients.allergies AS patient_allergies,
  patients.emergency_contact,
  patients.emergency_phone,
  patients.marital_status,
  patients.occupation,
  medical_history.chronic_illnesses,
  medical_history.surgeries,
  medical_history.current_medications,
  medical_history.hospitalizations,
  medical_history.family_history,
  medical_history.immunizations,
  medical_history.social_history,
  medical_history.other_conditions,
  lab_reports.test_date AS lab_test_date,
  lab_reports.hemoglobin,
  lab_reports.rbc,
  lab_reports.wbc,
  lab_reports.platelets,
  lab_reports.glucose,
  lab_reports.urea,
  lab_reports.creatinine,
  lab_reports.cholesterol,
  lab_reports.microbiology_findings,
  lab_reports.xray,
  lab_reports.ct_scan,
  lab_reports.mri,
  lab_reports.ultrasound,
  lab_reports.other_tests,
  diagnosis.diagnosis_date,
  diagnosis.symptoms,
  diagnosis.observations,
  diagnosis.provisional_diagnosis,
  diagnosis.tests,
  diagnosis.final_diagnosis,
  diagnosis.treatment_plan,
  diagnosis.follow_up,
  treatment.treatment_date,
  treatment.diagnosis AS treatment_diagnosis,
  treatment.medications,
  treatment.procedures,
  treatment.therapy_plan,
  treatment.diet,
  treatment.lifestyle,
  treatment.follow_up AS treatment_follow_up,
  treatment.additional_notes
    FROM 
      patients
    LEFT JOIN medical_history ON patients.patient_id = medical_history.patient_id
    LEFT JOIN lab_reports ON patients.patient_id = lab_reports.patient_id
    LEFT JOIN diagnosis ON patients.patient_id = diagnosis.patient_id
    LEFT JOIN treatment ON patients.patient_id = treatment.patient_id
    WHERE patients.patient_id = ?`;

  db.query(query, [searchPatientId], (err, results) => {
    if (err) {
      console.error('Error retrieving patient information:', err);
      res.status(500).send('Error retrieving patient information.');
    } else if (results.length === 0) {
      res.status(404).send('<h1>No records found for the given Patient ID.</h1><a href="/">Go Back</a>');
    } else {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Patient Search Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Patient Search Results</h1>
          <table>
            <tr><th>Field</th><th>Value</th></tr>
            ${Object.entries(results[0]).map(([key, value]) => `<tr><td>${key}</td><td>${value || 'N/A'}</td></tr>`).join('')}
          </table>
          <a href="/">Go Back</a>
        </body>
        </html>`;
      res.send(html);
    }
  });
});

// Start the server on port 3001
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
