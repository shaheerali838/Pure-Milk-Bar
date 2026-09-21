import fs from 'fs';
import path from 'path';

const replacements = [
  { regex: /placeholder=["']e\.g\.\s+Rahim Ullah Dairy Farm["']/g, replacement: 'placeholder="Enter supplier name"' },
  { regex: /placeholder=["']0300-1234567["']/g, replacement: 'placeholder="Enter phone number"' },
  { regex: /placeholder=["']e\.g\.\s+Green Meadows, Sahiwal["']/g, replacement: 'placeholder="Enter area"' },
  { regex: /placeholder=["']Village, Tehsil or Road address["']/g, replacement: 'placeholder="Enter address"' },
  { regex: /placeholder=["']228["']/g, replacement: 'placeholder="Enter rate"' },
  { regex: /placeholder=["']10["']/g, replacement: 'placeholder="Enter commission"' },
  { regex: /placeholder=["']JazzCash, EasyPaisa, or Bank IBAN details for payments["']/g, replacement: 'placeholder="Enter bank details"' },
  { regex: /placeholder=["']e\.g\.\s+Morning delivery by 7:00 AM, Gerber test minimum 4\.2% Fat\.\.\.["']/g, replacement: 'placeholder="Enter notes"' },
  { regex: /placeholder=["']e\.g\.\s+Milk collection van diesel \(Route 1 - Green Meadows\)["']/g, replacement: 'placeholder="Enter description"' },
  { regex: /placeholder=["']e\.g\.\s+Green Meadows Route Center["']/g, replacement: 'placeholder="Enter cost attribution"' },
  { regex: /placeholder=["']e\.g\.\s+Verified by Chilling Incharge\.\.\.["']/g, replacement: 'placeholder="Enter authorized by"' },
  { regex: /placeholder=["']e\.g\.\s+5000["']/g, replacement: 'placeholder="Enter amount"' },
  { regex: /placeholder=["']Enter amount paid to supplier\.\.\.["']/g, replacement: 'placeholder="Enter amount"' },
  { regex: /placeholder=["']e\.g\.\s+Paid in cash at morning gate \/ Online transfer["']/g, replacement: 'placeholder="Enter payment details"' },
  { regex: /placeholder=["']e\.g\.\s+50["']/g, replacement: 'placeholder="Enter quantity"' },
  { regex: /placeholder=["']e\.g\.\s+230["']/g, replacement: 'placeholder="Enter rate"' },
  { regex: /placeholder=["']Staff receiver name["']/g, replacement: 'placeholder="Enter receiver name"' },
  { regex: /placeholder=["']Optional delivery notes\.\.\.["']/g, replacement: 'placeholder="Enter notes"' },
  { regex: /placeholder=["']e\.g\.\s+Ali Hassan["']/g, replacement: 'placeholder="Enter name"' },
  { regex: /placeholder=["']0321-7654321["']/g, replacement: 'placeholder="Enter secondary number"' },
  { regex: /placeholder=["']35202-1234567-1["']/g, replacement: 'placeholder="Enter ID number"' },
  { regex: /placeholder=["']Reference person name["']/g, replacement: 'placeholder="Enter reference"' },
  { regex: /placeholder=["']e\.g\.\s+Model Town["']/g, replacement: 'placeholder="Enter area"' },
  { regex: /placeholder=["']e\.g\.\s+House #45, Block C["']/g, replacement: 'placeholder="Enter address"' },
  { regex: /placeholder=["']e\.g\.\s+2, 3, 5\.3["']/g, replacement: 'placeholder="Enter quantity"' },
  { regex: /placeholder=["']10000["']/g, replacement: 'placeholder="Enter credit limit"' },
  
  // New specific targets from grep search
  { regex: /placeholder=["']e\.g\.\s+Muhammad Farooq["']/g, replacement: 'placeholder="Enter name"' },
  { regex: /placeholder=["']e\.g\.\s+Model Town Block C, Shed 1["']/g, replacement: 'placeholder="Enter address"' },
  { regex: /placeholder=["']e\.g\.\s+2\.5["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']e\.g\.\s+180["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']e\.g\.\s+220["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']e\.g\.\s+30["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']e\.g\.\s+Pure Milk Bar & Dairy Farm["']/g, replacement: 'placeholder="Enter business name"' },
  { regex: /placeholder=["']e\.g\.\s+Haji Muhammad Aslam["']/g, replacement: 'placeholder="Enter name"' },
  { regex: /placeholder=["']e\.g\.\s+Plot 14-B, Dairy Complex, Bedian Road["']/g, replacement: 'placeholder="Enter address"' },
  { regex: /placeholder=["']e\.g\.\s+Lahore["']/g, replacement: 'placeholder="Enter city"' },
  { regex: /placeholder=["']e\.g\.\s+7812903-4["']/g, replacement: 'placeholder="Enter ID"' },
  { regex: /placeholder=["']e\.g\.\s+House 14-B, Street 3 \(Near Main Park\)["']/g, replacement: 'placeholder="Enter address"' },
  { regex: /placeholder=["']e\.g\.\s+House 12, Street 4, Block B["']/g, replacement: 'placeholder="Enter address"' },
  { regex: /placeholder=["']e\.g\.\s+PRD-001["']/g, replacement: 'placeholder="Enter code"' },
  { regex: /placeholder=["']e\.g\.\s+Fresh Buffalo Milk["']/g, replacement: 'placeholder="Enter name"' },
  { regex: /placeholder=["']e\.g\.\s+Settle month end udhaar \/ Counter cash received["']/g, replacement: 'placeholder="Enter details"' },
  { regex: /placeholder=["']e\.g\.\s+100["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']e\.g\.\s+500["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']e\.g\.\s+25["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']e\.g\.\s+Morning delivery route fill-up at PSO pump["']/g, replacement: 'placeholder="Enter details"' },
  { regex: /placeholder=["']e\.g\.\s+Morning route fill-up at PSO pump["']/g, replacement: 'placeholder="Enter details"' },
  { regex: /placeholder=["']e\.g\.\s+Shahid Rider["']/g, replacement: 'placeholder="Enter rider name"' },
  { regex: /placeholder=["']e\.g\.\s+0304-9988771["']/g, replacement: 'placeholder="Enter phone number"' },
  { regex: /placeholder=["']e\.g\.\s+Honda CD 70 \(LER-4521\)["']/g, replacement: 'placeholder="Enter vehicle details"' },
  { regex: /placeholder=["']e\.g\.\s+Route 1: Model Town & Faisal Town["']/g, replacement: 'placeholder="Enter route"' },
  { regex: /placeholder=["']e\.g\.\s+Model Town & Faisal Town["']/g, replacement: 'placeholder="Enter route"' },
  { regex: /placeholder=["']e\.g\.\s+2 L Cow Milk["']/g, replacement: 'placeholder="Enter subscription"' },
  { regex: /placeholder=["']E\.g\., Bought 20 bags of wanda\.\.\.["']/g, replacement: 'placeholder="Enter details"' },
  { regex: /placeholder=["']e\.g\.\s+Allah Ditta["']/g, replacement: 'placeholder="Enter name"' },
  { regex: /placeholder=["']e\.g\.\s+Sahiwal Queen["']/g, replacement: 'placeholder="Enter name"' },
  { regex: /placeholder=["']e\.g\.\s+Vaccinated for FMD, white patch on forehead\.\.\.["']/g, replacement: 'placeholder="Enter details"' },
  { regex: /placeholder=["']e\.g\.\s+Monthly salary payout for September 2026["']/g, replacement: 'placeholder="Enter details"' },
  { regex: /placeholder=["']e\.g\.\s+EP-998812["']/g, replacement: 'placeholder="Enter transaction ID"' },
  { regex: /placeholder=["']e\.g\.\s+Half Payment Received["']/g, replacement: 'placeholder="Enter details"' },
  // Generic fallback
  { regex: /placeholder=["']e\.g\.\s+[^"']+["']/g, replacement: 'placeholder="Enter value"' },
  { regex: /placeholder=["']E\.g\.\s+[^"']+["']/g, replacement: 'placeholder="Enter value"' }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir('./src');
let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(rep => {
    content = content.replace(rep.regex, rep.replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    filesModified++;
  }
});

console.log("Modified " + filesModified + " files.");
