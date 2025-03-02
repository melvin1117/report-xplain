import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as Minio from 'minio';
import { GeminiService } from 'src/services/gemini.service';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('pdf')
export class PdfUploadController {
  private bucketName = process.env.BUCKET_NAME;
  private minioClient: Minio.Client;

  constructor(
    private readonly minioService: MinioService,
    private readonly geminiService: GeminiService
  ) {
    this.minioService.createBucketIfNotExists(this.bucketName);
    this.minioClient = this.minioService.getClient();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new BadRequestException('Only PDF files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    console.log('After file validation');

    // Upload file to Minio
    try {
      const uniqueFileName = `${uuidv4()}-${file.originalname}`;

      await new Promise((resolve, reject) => {
        this.minioClient.putObject(
          this.bucketName,
          uniqueFileName,
          file.buffer,
          file.buffer.length,
          (err, etag) => {
            if (err) return reject(err);
            console.log('File uploaded to Minio with etag:', etag);
            resolve(etag);
          },
        );
      });
    } catch (error) {
      console.error('Error during Minio upload:', error);
      throw new InternalServerErrorException('Error uploading file to storage: ' + error.message);
    }

    // Read query from query.txt with absolute path
    let query: string;
    try {      
      // Read query from query.txt
      console.log('Resolved query file path:');
      query = `You are provided with a medical lab report in PDF format. Your task is to extract all the relevant information from the report and generate a detailed JSON response that presents both the original technical (medical) details and a friendly, human-centric interpretation. The report may be of any type (e.g., CBC, metabolic panels, imaging, etc.), so your response should be flexible enough to accommodate different lab report structures.

              Your output must include the following sections:

              1. *Metadata:* Extract and include all available personal and report details such as:
                - Patient name, age, gender, referred by, registration number, and any other details provided.
                - Report dates (e.g., registered on, collected on, received on, reported on).
                - Lab details including lab name, lab incharge, pathologist, location, etc. (if available).

              2. *Report Information:* Include identifiers such as reportId and patientId, and specify the reportType and one more field reportName as 'Patient name - reportType'

              3. *Summaries:* Generate three summaries:
                - medicalSummary: A summary using the original technical language from the report.
                - friendlySummary: A plain language version of the summary that makes the content easily understandable.
                - aiDiagnosisSummary: An AI-generated summary that highlights key diagnoses, findings, or insights.

              4. *Sections:* Organize the lab data into sections (e.g., “Hematology - Complete Blood Count” or “Metabolic Panel”) as applicable. Each section must contain:
                - A description of what the section covers, in both technical and friendly terms.
                - A list of metrics where each metric contains:
                  - metricName: The original technical name (e.g., Hemoglobin).
                  - metricFriendlyName: A user-friendly name (e.g., Oxygen Carrying Protein).
                  - value, unit, and referenceRange (expressed as min and max).
                  - medicalTerminology: The technical explanation of the metric.
                  - friendlyInterpretation: A plain language explanation of the metric's significance.
                  - status: Indicate if the metric is Normal, Low, or High.
                  - suggestions: Provide specific, actionable recommendations (dietary, lifestyle, etc.) if the value is not optimal.
                  - motivationalMessage: Offer positive feedback or insight on what the patient might be doing well that contributes to a normal result.

              5. *Charts:* Provide at least two types of charts based on the data:
                - One chart (e.g., a pie chart) that illustrates the distribution of key sub-parameters (e.g., differential counts in a CBC or any other logical grouping relevant to the report).
                - A second chart (e.g., a bullet chart) that compares one or more key parameters against their normal reference ranges, with a friendly description of what the visualization indicates.

              6. *Overall Suggestions:* Include a summary with actionable recommendations regarding dietary improvements, lifestyle changes, or further medical follow-ups based on the overall findings.

              7. *Chat Context:* Provide context to seed a chatbot that can answer follow-up questions. This context should summarize the key findings in a concise way.

              Use the following JSON format as your blueprint:

              {
                "metadata": {
                  "patientName": "Example Name",
                  "age": "Example Age",
                  "gender": "Example Gender",
                  "referredBy": "Example Referral",
                  "registrationNumber": "Example Reg Number",
                  "reportDates": {
                    "registeredOn": "YYYY-MM-DDTHH:MM:SS",
                    "collectedOn": "YYYY-MM-DD",
                    "receivedOn": "YYYY-MM-DD",
                    "reportedOn": "YYYY-MM-DDTHH:MM:SS"
                  },
                  "labDetails": {
                    "labName": "Example Lab Name",
                    "labIncharge": "Example Lab Incharge",
                    "pathologist": "Example Pathologist",
                    "location": "Example Location"
                  }
                },
                "reportId": "Unique Report Identifier",
                "patientId": "Unique Patient Identifier",
                "reportType": "Medical Lab Report Type",
                "reportName": "PatientName - Medical Lab Report Type",
                "summaries": {
                  "medicalSummary": "Original technical summary from the report.",
                  "friendlySummary": "Friendly plain-language version of the summary.",
                  "aiDiagnosisSummary": "AI-generated summary highlighting key diagnoses and insights."
                },
                "sections": [
                  {
                    "sectionTitle": "Section Title (e.g., Hematology - Complete Blood Count)",
                    "description": "Overview of the section covering both technical details and friendly explanations.",
                    "metrics": [
                      {
                        "metricName": "Technical Metric Name",
                        "metricFriendlyName": "User-Friendly Name",
                        "value": "Numeric or Text Value",
                        "unit": "Measurement Unit",
                        "referenceRange": {
                          "min": "Minimum Value",
                          "max": "Maximum Value"
                        },
                        "medicalTerminology": "Original medical explanation of this metric.",
                        "friendlyInterpretation": "Plain language interpretation of the metric and its significance.",
                        "status": "Normal/Low/High",
                        "suggestions": "Dietary, lifestyle, or other recommendations if needed.",
                        "motivationalMessage": "Positive feedback on what is being done well."
                      }
                      // Include additional metric objects as needed.
                    ]
                  }
                ],
                "charts": [
                  {
                    "chartTitle": "Chart Title (e.g., Differential Distribution)",
                    "chartType": "pie or other chart type",
                    "data": [
                      { "label": "Category Name", "value": NumericValue }
                      // Additional data points as relevant.
                    ],
                    "friendlyDescription": "Description of what this chart shows and its significance."
                  },
                  {
                    "chartTitle": "Key Parameters Overview",
                    "chartType": "bullet or another meaningful chart type",
                    "data": [
                      {
                        "parameter": "Parameter Name",
                        "value": NumericValue,
                        "referenceRange": { "min": NumericValue, "max": NumericValue }
                      }
                      // Additional parameters as applicable.
                    ],
                    "friendlyDescription": "A visual representation comparing key parameters against their normal ranges."
                  }
                ],
                "overallSuggestions": "Aggregate suggestions regarding dietary improvements, lifestyle changes, and any other recommendations to optimize health.",
                "chatContext": [
                  {
                    "contextId": "context_identifier",
                    "contextText": "A concise summary of the report's findings to provide context for follow-up questions."
                  }
                ]
              }

              Please output the complete JSON response following the above structure using the data extracted from the provided PDF report.`;

    } catch (error) {
      console.error('Error reading query file:', error);
      throw new InternalServerErrorException('Error reading query file');
    }

    // Process PDF via Gemini Service
    let processedData;
    try {
      processedData = await this.geminiService.processPDFBuffer(file.buffer, query);
    } catch (error) {
      console.error('Error during Gemini API processing:', error);
      throw new InternalServerErrorException('Error processing PDF with Gemini API');
    }

    return { message: 'File processed successfully', data: processedData };
  }
}
