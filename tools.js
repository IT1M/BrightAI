document.addEventListener('DOMContentLoaded', function() {
  // إخفاء مفتاح API في تكوين آمن (يُفضل استخدام backend للتعامل مع مفاتيح API)
  const config = {
    apiKey: '********', // لا تعرض مفتاح API مباشرة، يُفضل استخدام backend proxy
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  };
  
  // تحقق من مفتاح API (في حالة backend)
  const getAPIKey = () => {
    // في بيئة الإنتاج، يُفضل طلب المفتاح من backend
    return 'AIzaSyCMrm1LjmlJObZsVCQEuy_wTkh9ZEEc8aQ';
  };
  
  // واجهة موحدة لطلبات الذكاء الاصطناعي
  const AIService = {
    async requestCompletion(prompt) {
      try {
        const response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'x-goog-api-key': getAPIKey(),
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }],
            }]
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`خطأ في الطلب: ${response.status}, التفاصيل: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0 && data.candidates[0].content.parts[0].text) {
          return data.candidates[0].content.parts[0].text;
        } else {
          throw new Error("استجابة غير صالحة من واجهة Gemini: لم يتم العثور على نص في الاستجابة");
        }
      } catch (error) {
        console.error("خطأ في استدعاء واجهة Gemini:", error);
        UIManager.showNotification(error.message, 'error');
        throw error;
      }
    }
  };
  
  // إدارة واجهة المستخدم
  const UIManager = {
    showLoading(elementId, message) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = message || 'جاري التحميل...';
        element.classList.add('loading');
      }
    },
    
    hideLoading(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.remove('loading');
      }
    },
    
    updateOutput(elementId, content, isHTML = false) {
      const element = document.getElementById(elementId);
      if (element) {
        if (isHTML) {
          element.innerHTML = content;
        } else {
          element.textContent = content;
        }
      }
    },
    
    showNotification(message, type = 'info') {
      const notificationId = 'notification-' + Date.now();
      const colors = {
        success: 'var(--accent-color)',
        error: 'var(--accent-secondary)',
        info: 'var(--primary-color)'
      };
      
      const notification = document.createElement('div');
      notification.id = notificationId;
      notification.className = 'notification';
      notification.style.backgroundColor = colors[type];
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // إزالة الإشعار بعد 4 ثوانٍ
      setTimeout(() => {
        const notificationElement = document.getElementById(notificationId);
        if (notificationElement) {
          notificationElement.remove();
        }
      }, 4000);
    },
    
    toggleVisibility(elementId, isVisible) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = isVisible ? 'inline-block' : 'none';
      }
    }
  };
  
  // معالجة اللغة
  const LanguageService = {
    async detectLanguage(text) {
      try {
        // استخدام مكتبة franc لتحديد اللغة
        const franc = await import('https://esm.sh/franc@6?bundle');
        const detectedLang = franc.franc(text);
        
        if (detectedLang === 'ara') {
          return 'ar';
        }
        if (detectedLang === 'eng') {
          return 'en';
        }
        return 'en'; // الإنجليزية كلغة افتراضية
      } catch (error) {
        console.error('خطأ في تحديد اللغة:', error);
        return 'en';
      }
    },
    
    getDirectionByLanguage(language) {
      return language === 'ar' ? 'rtl' : 'ltr';
    },
    
    getAlignmentByLanguage(language) {
      return language === 'ar' ? 'right' : 'left';
    }
  };
  
  // سجل البيانات والحالة
  const DataStore = {
    resumeData: {
      cvContent: '',
      coverLetterContent: ''
    },
    
    jobSearchData: {
      searchContent: ''
    },
    
    setResumeData(cv, coverLetter) {
      this.resumeData.cvContent = cv;
      this.resumeData.coverLetterContent = coverLetter;
    },
    
    setJobSearchData(content) {
      this.jobSearchData.searchContent = content;
    }
  };
  
  // أداة السيرة الذاتية
  const ResumeBuilder = {
    async generateResume() {
      const outputId = 'resume-output';
      const template = document.getElementById('template-select')?.value || 'حديث';
      let language = document.getElementById('language-select')?.value || 'ar';
      const name = document.getElementById('name')?.value || '';
      const jobTitle = document.getElementById('job-title')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const phone = document.getElementById('phone')?.value || '';
      const linkedin = document.getElementById('linkedin')?.value || '';
      const objective = document.getElementById('objective')?.value || '';
      const resumeFile = document.getElementById('resume-upload')?.files[0];
      
      UIManager.showLoading(outputId, language === 'ar' ? 
        'جاري إنشاء السيرة الذاتية وخطاب التقديم...' : 
        'Generating resume and cover letter...');
      
      try {
        // معالجة ملف السيرة الذاتية المرفوع
        let resumeText = '';
        if (resumeFile) {
          resumeText = await this.readFileContent(resumeFile);
          const detectedFileLang = await LanguageService.detectLanguage(resumeText);
          if (detectedFileLang) {
            language = detectedFileLang;
            const langSelect = document.getElementById('language-select');
            if (langSelect) langSelect.value = language;
          }
        }
        
        // جمع معلومات الخبرة
        const experience = this.collectExperienceData();
        
        // جمع معلومات التعليم
        const education = this.collectEducationData();
        
        // المهارات
        const skills = document.getElementById('skills')?.value || '';
        
        // جمع معلومات المشاريع
        const projects = this.collectProjectsData();
        
        // معلومات خطاب التقديم
        const companyName = document.getElementById('company-name')?.value || '';
        const relevantSkills = document.getElementById('relevant-skills')?.value || '';
        const interestReason = document.getElementById('interest-reason')?.value || '';
        
        // إنشاء نص الطلب بناءً على اللغة
        const { cvPrompt, coverLetterPrompt } = this.createPrompts(
          language, template, name, email, phone, linkedin, objective, 
          experience, education, skills, projects, resumeText,
          jobTitle, companyName, relevantSkills, interestReason
        );
        
        // طلب توليد السيرة الذاتية وخطاب التقديم
        const generatedCV = await AIService.requestCompletion(cvPrompt);
        const generatedCoverLetter = await AIService.requestCompletion(coverLetterPrompt);
        
        // تحسين السيرة الذاتية وخطاب التقديم
        const cvImprovementPrompt = language === 'ar' ? 
          `حسن النص التالي واجعله أكثر جاذبية باستخدام لغة احترافية وتنسيق ملائم: ${generatedCV}` : 
          `Improve the following text and make it more engaging using professional language and formatting: ${generatedCV}`;
          
        const coverLetterImprovementPrompt = language === 'ar' ? 
          `حسن النص التالي واجعله أكثر جاذبية باستخدام لغة احترافية وتنسيق ملائم: ${generatedCoverLetter}` : 
          `Improve the following text and make it more engaging using professional language and formatting: ${generatedCoverLetter}`;
        
        const improvedCV = await AIService.requestCompletion(cvImprovementPrompt);
        const improvedCoverLetter = await AIService.requestCompletion(coverLetterImprovementPrompt);
        
        // حفظ البيانات للتنزيل لاحقًا
        DataStore.setResumeData(improvedCV, improvedCoverLetter);
        
        // عرض النتائج
        const direction = LanguageService.getDirectionByLanguage(language);
        const textAlign = LanguageService.getAlignmentByLanguage(language);
        
        const outputHTML = `
          <strong>${language === 'ar' ? 'السيرة الذاتية' : 'Resume'}:</strong>
          <pre style="direction: ${direction}; text-align: ${textAlign};">${improvedCV}</pre><br>
          <strong>${language === 'ar' ? 'خطاب التقديم' : 'Cover Letter'}:</strong>
          <pre style="direction: ${direction}; text-align: ${textAlign};">${improvedCoverLetter}</pre>
        `;
        
        UIManager.updateOutput(outputId, outputHTML, true);
        
        // إظهار أزرار التنزيل
        UIManager.toggleVisibility('download-resume', true);
        UIManager.toggleVisibility('download-cover-letter', true);
        
        UIManager.showNotification(
          language === 'ar' ? 'تم إنشاء السيرة الذاتية وخطاب التقديم بنجاح' : 
          'Resume and cover letter generated successfully', 
          'success'
        );
      } catch (error) {
        const errorMsg = `<strong>${language === 'ar' ? 
          'حدث خطأ أثناء إنشاء السيرة الذاتية وخطاب التقديم' : 
          'Error generating resume and cover letter'}:</strong><br> ${error.message}`;
        
        UIManager.updateOutput(outputId, errorMsg, true);
        UIManager.showNotification(error.message, 'error');
      }
    },
    
    async readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });
    },
    
    collectExperienceData() {
      let experience = '';
      const entries = document.querySelectorAll('#experience-fields .experience-entry');
      const language = document.getElementById('language-select')?.value || 'ar';
      
      entries.forEach(entry => {
        const company = entry.querySelector('.company')?.value || '';
        const position = entry.querySelector('.position')?.value || '';
        const date = entry.querySelector('.date')?.value || '';
        const responsibilities = entry.querySelector('.responsibilities')?.value || '';
        
        experience += `${language === 'ar' ? 'الشركة' : 'Company'}: ${company}\n${language === 'ar' ? 'المسمى الوظيفي' : 'Position'}: ${position}\n${language === 'ar' ? 'الفترة' : 'Period'}: ${date}\n${language === 'ar' ? 'المسؤوليات' : 'Responsibilities'}: ${responsibilities}\n\n`;
      });
      
      return experience;
    },
    
    collectEducationData() {
      let education = '';
      const entries = document.querySelectorAll('#education-fields .education-entry');
      const language = document.getElementById('language-select')?.value || 'ar';
      
      entries.forEach(entry => {
        const degree = entry.querySelector('.degree')?.value || '';
        const university = entry.querySelector('.university')?.value || '';
        const graduationDate = entry.querySelector('.graduation-date')?.value || '';
        
        education += `${language === 'ar' ? 'الشهادة' : 'Degree'}: ${degree}\n${language === 'ar' ? 'الجامعة' : 'University'}: ${university}\n${language === 'ar' ? 'سنة التخرج' : 'Graduation Year'}: ${graduationDate}\n\n`;
      });
      
      return education;
    },
    
    collectProjectsData() {
      let projects = '';
      const entries = document.querySelectorAll('#projects-fields .project-entry');
      const language = document.getElementById('language-select')?.value || 'ar';
      
      entries.forEach(entry => {
        const projectName = entry.querySelector('.project-name')?.value || '';
        const projectDescription = entry.querySelector('.project-description')?.value || '';
        const projectTools = entry.querySelector('.project-tools')?.value || '';
        
        projects += `${language === 'ar' ? 'اسم المشروع' : 'Project Name'}: ${projectName}\n${language === 'ar' ? 'الوصف' : 'Description'}: ${projectDescription}\n${language === 'ar' ? 'الأدوات' : 'Tools'}: ${projectTools}\n\n`;
      });
      
      return projects;
    },
    
    createPrompts(language, template, name, email, phone, linkedin, objective, experience, education, skills, projects, resumeText, jobTitle, companyName, relevantSkills, interestReason) {
      let cvPrompt = '';
      let coverLetterPrompt = '';
      
      if (language === 'ar') {
        cvPrompt = `قم بإنشاء سيرة ذاتية احترافية باللغة العربية بناءً على المعلومات التالية، باستخدام قالب ${template}:\n`;
        cvPrompt += `الاسم: ${name}\nالبريد الإلكتروني: ${email}\nرقم الهاتف: ${phone}\nLinkedIn: ${linkedin}\n`;
        cvPrompt += `الهدف المهني: ${objective}\nالخبرة المهنية: ${experience}\nالتعليم: ${education}\n`;
        cvPrompt += `المهارات: ${skills}\nالمشاريع: ${projects}\n`;
        
        if (resumeText) {
          cvPrompt += `بالإضافة إلى تحليل السيرة الذاتية المرفقة: ${resumeText}\n`;
        }
        
        cvPrompt += "يجب أن يكون التنسيق متناسقًا (ترويسة، خطوط مميزة، أقسام مرتبة)، وقم بتنظيم المعلومات بطريقة مهنية وملائمة لسوق العمل العربي.";
        
        coverLetterPrompt = `قم بإنشاء خطاب تقديم رسمي باللغة العربية للوظيفة ${jobTitle} في شركة ${companyName} بناءً على المعلومات التالية:\n`;
        coverLetterPrompt += `المهارات ذات الصلة: ${relevantSkills}\nسبب الاهتمام بالشركة: ${interestReason}\n`;
        coverLetterPrompt += "يجب أن يشمل الخطاب تحية مخصصة، مقدمة توضح شغف المستخدم بالوظيفة، تسليط الضوء على المهارات والخبرات ذات الصلة، وفقرة ختامية تحث على التواصل مع شكر مخصص. استخدم لغة رسمية ومهنية مناسبة للثقافة العربية.";
      } else {
        cvPrompt = `Create a professional resume in English based on the following information, using the ${template} template:\n`;
        cvPrompt += `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLinkedIn: ${linkedin}\n`;
        cvPrompt += `Objective: ${objective}\nExperience: ${experience}\nEducation: ${education}\n`;
        cvPrompt += `Skills: ${skills}\nProjects: ${projects}\n`;
        
        if (resumeText) {
          cvPrompt += `In addition to analyze the attached resume: ${resumeText}\n`;
        }
        
        cvPrompt += "The format should be consistent (header, distinct fonts, organized sections) and information should be organized professionally following best practices for modern resumes.";
        
        coverLetterPrompt = `Create a formal cover letter in English for the position of ${jobTitle} at ${companyName} based on the following information:\n`;
        coverLetterPrompt += `Relevant Skills: ${relevantSkills}\nReason for Interest in the Company: ${interestReason}\n`;
        coverLetterPrompt += "The letter should include a personalized salutation, an introduction outlining the user's passion for the position, highlighting relevant skills and experiences, and a concluding paragraph urging contact with a personalized thank you. Use formal business English.";
      }
      
      return { cvPrompt, coverLetterPrompt };
    },
    
    downloadResume() {
      if (!DataStore.resumeData.cvContent) {
        UIManager.showNotification('لا توجد سيرة ذاتية لتنزيلها', 'error');
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const language = document.getElementById('language-select')?.value || 'ar';
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      try {
        pdf.setFont(language === 'ar' ? 'Amiri-Regular' : 'Helvetica', 'normal');
        const textOptions = { 
          align: language === 'ar' ? 'right' : 'left',
          maxWidth: 180
        };
        
        // تقسيم النص إلى سطور للتعامل مع النصوص الطويلة
        const lines = DataStore.resumeData.cvContent.split('\n');
        let y = 20;
        
        lines.forEach(line => {
          pdf.text(line, language === 'ar' ? 190 : 10, y, textOptions);
          y += 7;
          
          // إضافة صفحة جديدة عند اللزوم
          if (y > 280) {
            pdf.addPage();
            y = 20;
          }
        });
        
        pdf.save("resume.pdf");
        UIManager.showNotification(
          language === 'ar' ? 'تم تنزيل السيرة الذاتية بنجاح' : 'Resume downloaded successfully', 
          'success'
        );
      } catch (error) {
        console.error('خطأ في تنزيل السيرة الذاتية:', error);
        UIManager.showNotification(
          language === 'ar' ? 'حدث خطأ أثناء تنزيل السيرة الذاتية' : 'Error downloading resume', 
          'error'
        );
      }
    },
    
    downloadCoverLetter() {
      if (!DataStore.resumeData.coverLetterContent) {
        UIManager.showNotification('لا يوجد خطاب تقديم لتنزيله', 'error');
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const language = document.getElementById('language-select')?.value || 'ar';
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      try {
        pdf.setFont(language === 'ar' ? 'Amiri-Regular' : 'Helvetica', 'normal');
        const textOptions = { 
          align: language === 'ar' ? 'right' : 'left',
          maxWidth: 180
        };
        
        // تقسيم النص إلى سطور للتعامل مع النصوص الطويلة
        const lines = DataStore.resumeData.coverLetterContent.split('\n');
        let y = 20;
        
        lines.forEach(line => {
          pdf.text(line, language === 'ar' ? 190 : 10, y, textOptions);
          y += 7;
          
          // إضافة صفحة جديدة عند اللزوم
          if (y > 280) {
            pdf.addPage();
            y = 20;
          }
        });
        
        pdf.save("cover_letter.pdf");
        UIManager.showNotification(
          language === 'ar' ? 'تم تنزيل خطاب التقديم بنجاح' : 'Cover letter downloaded successfully', 
          'success'
        );
      } catch (error) {
        console.error('خطأ في تنزيل خطاب التقديم:', error);
        UIManager.showNotification(
          language === 'ar' ? 'حدث خطأ أثناء تنزيل خطاب التقديم' : 'Error downloading cover letter', 
          'error'
        );
      }
    }
  };
  
  // أداة البحث عن وظائف
  const JobSearch = {
    async searchJobs() {
      const outputId = 'saudi-jobs-output';
      const location = document.getElementById('job-location')?.value || '';
      const jobField = document.getElementById('job-field')?.value || '';
      const skills = document.getElementById('job-skills')?.value || '';
      const resumeFile = document.getElementById('resume-upload')?.files[0];
      
      UIManager.showLoading(outputId, 'جاري البحث عن الوظائف...');
      
      try {
        let resumeText = '';
        let language = document.getElementById('language-select')?.value || 'ar';
        
        if (resumeFile) {
          resumeText = await ResumeBuilder.readFileContent(resumeFile);
          const detectedFileLang = await LanguageService.detectLanguage(resumeText);
          if (detectedFileLang) {
            language = detectedFileLang;
          }
        }
        
        let prompt = `ابحث عن وظائف في المملكة العربية السعودية، في مدينة ${location} ومجال ${jobField}، مستخدماً المهارات التالية: ${skills}. `;
        
        if (resumeText) {
          prompt += `بالإضافة إلى تحليل السيرة الذاتية المرفقة لتحسين فرص القبول: ${resumeText}`;
        }
        
        prompt += 'قم بإعداد تقرير يتضمن فرص التحسين في السيرة الذاتية، وأبرز الوظائف المناسبة التي تم العثور عليها، بالإضافة إلى نصائح عملية لتطوير السيرة الذاتية وزيادة فرص القبول. نظم النتائج في أقسام واضحة.';
        
        const result = await AIService.requestCompletion(prompt);
        
        // حفظ النتائج للتنزيل لاحقًا
        DataStore.setJobSearchData(result);
        
        const direction = LanguageService.getDirectionByLanguage(language);
        const textAlign = LanguageService.getAlignmentByLanguage(language);
        
        const outputHTML = `
          <strong>نتائج البحث:</strong><br>
          <pre style="direction: ${direction}; text-align: ${textAlign};">${result}</pre>
        `;
        
        UIManager.updateOutput(outputId, outputHTML, true);
        UIManager.toggleVisibility('download-search-results', true);
        UIManager.showNotification('تم العثور على نتائج البحث بنجاح', 'success');
      } catch (error) {
        const errorMsg = `<strong>حدث خطأ أثناء البحث عن الوظائف:</strong><br> ${error.message}`;
        UIManager.updateOutput(outputId, errorMsg, true);
        UIManager.showNotification(error.message, 'error');
      }
    },
    
    downloadSearchResults() {
      if (!DataStore.jobSearchData.searchContent) {
        UIManager.showNotification('لا توجد نتائج بحث لتنزيلها', 'error');
        return;
      }
      
      const { jsPDF } = window.jspdf;
      const language = document.getElementById('language-select')?.value || 'ar';
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      try {
        pdf.setFont(language === 'ar' ? 'Amiri-Regular' : 'Helvetica', 'normal');
        const textOptions = { 
          align: language === 'ar' ? 'right' : 'left',
          maxWidth: 180
        };
        
        // تقسيم النص إلى سطور للتعامل مع النصوص الطويلة
        const lines = DataStore.jobSearchData.searchContent.split('\n');
        let y = 20;
        
        // إضافة عنوان
        pdf.setFontSize(16);
        pdf.text('نتائج البحث عن الوظائف', language === 'ar' ? 190 : 10, y, textOptions);
        y += 15;
        
        // إعادة حجم الخط للمحتوى
        pdf.setFontSize(12);
        
        lines.forEach(line => {
          pdf.text(line, language === 'ar' ? 190 : 10, y, textOptions);
          y += 7;
          
          // إضافة صفحة جديدة عند اللزوم
          if (y > 280) {
            pdf.addPage();
            y = 20;
          }
        });
        
        pdf.save("job_search_results.pdf");
        UIManager.showNotification('تم تنزيل نتائج البحث بنجاح', 'success');
      } catch (error) {
        console.error('خطأ في تنزيل نتائج البحث:', error);
        UIManager.showNotification('حدث خطأ أثناء تنزيل نتائج البحث', 'error');
      }
    }
  };
  
  // أداة الرسوم البيانية
  const ChartGenerator = {
    chart: null,
    
    generateChart() {
      const chartType = document.getElementById('chartType')?.value || 'bar';
      const labelsInput = document.getElementById('chartLabels')?.value || '';
      const dataInput = document.getElementById('chartData')?.value || '';
      
      const labels = labelsInput.split(',').map(label => label.trim());
      const data = dataInput.split(',').map(Number);
      
      if (labels.length === 0 || data.length === 0 || labels.length !== data.length) {
        UIManager.showNotification('يرجى إدخال عناوين وقيم صحيحة', 'error');
        return;
      }
      
      const ctx = document.getElementById('myChart')?.getContext('2d');
      if (!ctx) {
        UIManager.showNotification('لم يتم العثور على عنصر الرسم البياني', 'error');
        return;
      }
      
      if (this.chart) {
        this.chart.destroy();
      }
      
      // ألوان متناسقة للرسوم البيانية
      const backgroundColors = [
        'rgba(56, 189, 248, 0.6)',
        'rgba(30, 58, 138, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(168, 85, 247, 0.6)',
        'rgba(249, 115, 22, 0.6)'
      ];
      
      this.chart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: labels,
          datasets: [{
            label: 'بيانات المستخدم',
            data: data,
            backgroundColor: chartType === 'pie' || chartType === 'doughnut' ? 
              backgroundColors : 'rgba(56, 189, 248, 0.6)',
            borderColor: 'rgba(30, 58, 138, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  family: "'Cairo', 'Tajawal', sans-serif"
                }
              }
            },
            title: {
              display: true,
              text: 'رسم بياني للبيانات',
              font: {
                family: "'Cairo', 'Tajawal', sans-serif",
                size: 16
              }
            },
            tooltip: {
              titleFont: {
                family: "'Cairo', 'Tajawal', sans-serif"
              },
              bodyFont: {
                family: "'Cairo', 'Tajawal', sans-serif"
              }
            }
          },
          scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
            x: {
              ticks: {
                font: {
                  family: "'Cairo', 'Tajawal', sans-serif"
                }
              }
            },
            y: {
              ticks: {
                font: {
                  family: "'Cairo', 'Tajawal', sans-serif"
                }
              },
              beginAtZero: true
            }
          } : {}
        }
      });
      
      UIManager.showNotification('تم إنشاء الرسم البياني بنجاح', 'success');
    },
    
    exportToPDF() {
      if (!this.chart) {
        UIManager.showNotification('يرجى إنشاء رسم بياني أولاً', 'error');
        return;
      }
      
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // إضافة عنوان للملف
        pdf.setFont('Amiri-Regular', 'normal');
        pdf.setFontSize(16);
        pdf.text("الرسم البياني", 100, 15, { align: 'center' });
        
        // تحويل الرسم البياني إلى صورة
        const chartImage = this.chart.toBase64Image();
        
        // إضافة الصورة إلى ملف PDF
        pdf.addImage(chartImage, 'PNG', 15, 30, 180, 100);
        
        // تنزيل الملف
        pdf.save("chart.pdf");
        UIManager.showNotification('تم تنزيل الرسم البياني بنجاح', 'success');
      } catch (error) {
        console.error('خطأ في تنزيل الرسم البياني:', error);
        UIManager.showNotification('حدث خطأ أثناء تنزيل الرسم البياني', 'error');
      }
    }
  };
  
  // أداة مولد أكواد HTML
  const HTMLGenerator = {
    async generateHTML() {
      const outputId = 'html-output';
      const websiteType = document.getElementById('website-type')?.value || '';
      const components = Array.from(document.querySelectorAll('input[name="components"]:checked')).map(c => c.value).join(', ');
      const colors = document.getElementById('colors')?.value || '';
      const fonts = document.getElementById('fonts')?.value || '';
      const content = document.getElementById('content')?.value || '';
      const cssOption = document.querySelector('input[name="css_option"]:checked')?.value || 'inline';
      const inlineCssCode = document.getElementById('inline-css-code')?.value || '';
      const externalCssFile = document.getElementById('external-css-file')?.value || '';
      
      if (!websiteType || !components || !content) {
        UIManager.showNotification('الرجاء إدخال جميع المواصفات المطلوبة', 'error');
        return;
      }
      
      UIManager.showLoading(outputId, 'جاري إنشاء كود HTML...');
      
      try {
        let prompt = `أنشئ كود HTML ل${websiteType} يتضمن ${components} كمكونات أساسية. `;
        prompt += `استخدم الألوان ${colors} والخطوط ${fonts}. المحتوى هو: ${content}. `;
        
        if (cssOption === 'inline' && inlineCssCode) {
          prompt += `أضف CSS مدمج: ${inlineCssCode}. `;
        } else if (cssOption === 'external' && externalCssFile) {
          prompt += `استخدم ملف CSS خارجي من الرابط: ${externalCssFile}. `;
        }
        
        prompt += "أضف تعليقات داخل الكود لشرح كل قسم، ودعم اللغة العربية مع اتجاه RTL. الكود يجب أن يكون متجاوباً مع جميع أحجام الشاشات.";
        
        const generatedHTML = await AIService.requestCompletion(prompt);
        
        // تنسيق الكود للعرض
        const formattedHTML = `<pre><code class="language-html">${generatedHTML}</code></pre>`;
        UIManager.updateOutput(outputId, formattedHTML, true);
        
        // حفظ الكود للتنزيل لاحقًا
        document.getElementById(outputId).dataset.htmlContent = generatedHTML;
        
        UIManager.toggleVisibility('download-html', true);
        UIManager.showNotification('تم إنشاء كود HTML بنجاح', 'success');
        
        // تفعيل إضاءة بناء الجملة إذا كانت مكتبة highlight.js متاحة
        if (typeof hljs !== 'undefined') {
          hljs.highlightAll();
        }
      } catch (error) {
        const errorMsg = `<strong>حدث خطأ أثناء إنشاء كود HTML:</strong><br> ${error.message}`;
        UIManager.updateOutput(outputId, errorMsg, true);
        UIManager.showNotification(error.message, 'error');
      }
    },
    
    downloadHTMLCode() {
      const outputDiv = document.getElementById('html-output');
      if (!outputDiv || !outputDiv.dataset.htmlContent) {
        UIManager.showNotification('لا يوجد كود HTML لتنزيله', 'error');
        return;
      }
      
      const content = outputDiv.dataset.htmlContent;
      const filename = 'generated_code.html';
      
      try {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UIManager.showNotification('تم تنزيل كود HTML بنجاح', 'success');
      } catch (error) {
        console.error('خطأ في تنزيل كود HTML:', error);
        UIManager.showNotification('حدث خطأ أثناء تنزيل كود HTML', 'error');
      }
    }
  };
  
  // التطبيقات الأخرى
  const AITools = {
    async analyzeInventory() {
      const input = document.getElementById('inventory-input')?.value?.trim();
      const outputId = 'inventory-output';
      
      if (!input) {
        UIManager.updateOutput(outputId, 'الرجاء إدخال بيانات المخزون.');
        return;
      }
      
      UIManager.showLoading(outputId, 'جاري تحليل بيانات المخزون...');
      
      try {
        const prompt = `قم بتحليل بيانات المخزون التالية وتقديم توصيات مفصلة لتحسين إدارة المخزون، مع التركيز على تحسين الكفاءة وتقليل التكاليف: ${input}`;
        const result = await AIService.requestCompletion(prompt);
        
        UIManager.updateOutput(outputId, `<strong>تحليل المخزون:</strong><br>${result}`, true);
        UIManager.showNotification('تم تحليل بيانات المخزون بنجاح', 'success');
      } catch (error) {
        UIManager.updateOutput(outputId, `<strong>حدث خطأ أثناء تحليل المخزون:</strong><br> ${error.message}`, true);
        UIManager.showNotification(error.message, 'error');
      }
    },
    
    async analyzeSales() {
      const input = document.getElementById('sales-input')?.value?.trim();
      const outputId = 'sales-output';
      
      if (!input) {
        UIManager.updateOutput(outputId, 'الرجاء إدخال بيانات المبيعات.');
        return;
      }
      
      UIManager.showLoading(outputId, 'جاري تحليل بيانات المبيعات...');
      
      try {
        const prompt = `قم بتحليل بيانات المبيعات التالية وتقديم توصيات مفصلة: ${input}. حدد الاتجاهات، نقاط القوة والضعف، واقترح استراتيجيات لزيادة المبيعات. نظم النتائج في أقسام واضحة.`;
        const result = await AIService.requestCompletion(prompt);
        
        UIManager.updateOutput(outputId, `<strong>تحليل المبيعات:</strong><br>${result}`, true);
        UIManager.showNotification('تم تحليل بيانات المبيعات بنجاح', 'success');
      } catch (error) {
        UIManager.updateOutput(outputId, `<strong>حدث خطأ أثناء تحليل المبيعات:</strong><br> ${error.message}`, true);
        UIManager.showNotification(error.message, 'error');
      }
    },
    
    async generateInvoice() {
      const input = document.getElementById('invoice-input')?.value?.trim();
      const outputId = 'invoice-output';
      
      if (!input) {
        UIManager.updateOutput(outputId, 'الرجاء إدخال بيانات الفاتورة.');
        return;
      }
      
      UIManager.showLoading(outputId, 'جاري إنشاء الفاتورة...');
      
      try {
        const prompt = `قم بإنشاء فاتورة منسقة واحترافية بناءً على البيانات التالية: ${input}. تأكد من تضمين جميع العناصر الضرورية للفاتورة (المورد، العميل، التاريخ، رقم الفاتورة، المنتجات/الخدمات، الأسعار، الضرائب، المجموع، شروط الدفع).`;
        const result = await AIService.requestCompletion(prompt);
        
        UIManager.updateOutput(outputId, `<strong>الفاتورة:</strong><br>${result}`, true);
        UIManager.showNotification('تم إنشاء الفاتورة بنجاح', 'success');
      } catch (error) {
        UIManager.updateOutput(outputId, `<strong>حدث خطأ أثناء إنشاء الفاتورة:</strong><br> ${error.message}`, true);
        UIManager.showNotification(error.message, 'error');
      }
    },
    
    // باقي دوال الأدوات
    async generateLearningPlan() {
      const input = document.getElementById('learning-input')?.value?.trim();
      const outputId = 'learning-output';
      
      if (!input) {
        UIManager.updateOutput(outputId, 'الرجاء إدخال موضوع الدراسة.');
        return;
      }
      
      UIManager.showLoading(outputId, 'جاري توليد توصيات التعلم...');
      
      try {
        const prompt = `قم بإنشاء خطة تعلم مخصصة ومفصلة للموضوع التالي: ${input}. يجب أن تشمل الخطة مسار التعلم المقترح، المصادر الموصى بها، الأنشطة العملية، وكيفية قياس التقدم. قسم الخطة إلى مراحل واضحة ومنطقية.`;
        const result = await AIService.requestCompletion(prompt);
        
        UIManager.updateOutput(outputId, `<strong>خطة التعلم:</strong><br>${result}`, true);
        UIManager.showNotification('تم إنشاء خطة التعلم بنجاح', 'success');
      } catch (error) {
        UIManager.updateOutput(outputId, `<strong>حدث خطأ أثناء إنشاء خطة التعلم:</strong><br> ${error.message}`, true);
        UIManager.showNotification(error.message, 'error');
      }
    }
  };
  
  // إعداد مستمعي الأحداث
  function setupEventListeners() {
    // أحداث أداة السيرة الذاتية
    const generateResumeButton = document.getElementById('generate-resume');
    if (generateResumeButton) {
      generateResumeButton.addEventListener('click', ResumeBuilder.generateResume.bind(ResumeBuilder));
    }
    
    const downloadResumeButton = document.getElementById('download-resume');
    if (downloadResumeButton) {
      downloadResumeButton.addEventListener('click', ResumeBuilder.downloadResume.bind(ResumeBuilder));
    }
    
    const downloadCoverLetterButton = document.getElementById('download-cover-letter');
    if (downloadCoverLetterButton) {
      downloadCoverLetterButton.addEventListener('click', ResumeBuilder.downloadCoverLetter.bind(ResumeBuilder));
    }
    
    // أحداث البحث عن وظائف
    const searchJobsButton = document.getElementById('search-jobs');
    if (searchJobsButton) {
      searchJobsButton.addEventListener('click', JobSearch.searchJobs.bind(JobSearch));
    }
    
    const downloadSearchResultsButton = document.getElementById('download-search-results');
    if (downloadSearchResultsButton) {
      downloadSearchResultsButton.addEventListener('click', JobSearch.downloadSearchResults.bind(JobSearch));
    }
    
    // أحداث الرسوم البيانية
    const generateChartButton = document.getElementById('generateChart');
    if (generateChartButton) {
      generateChartButton.addEventListener('click', ChartGenerator.generateChart.bind(ChartGenerator));
    }
    
    const exportChartButton = document.getElementById('exportPDF');
    if (exportChartButton) {
      exportChartButton.addEventListener('click', ChartGenerator.exportToPDF.bind(ChartGenerator));
    }
    
    // أحداث مولد HTML
    const generateHTMLButton = document.getElementById('generate-html');
    if (generateHTMLButton) {
      generateHTMLButton.addEventListener('click', HTMLGenerator.generateHTML.bind(HTMLGenerator));
    }
    
    const downloadHTMLButton = document.getElementById('download-html');
    if (downloadHTMLButton) {
      downloadHTMLButton.addEventListener('click', HTMLGenerator.downloadHTMLCode.bind(HTMLGenerator));
    }
    
    // أحداث خيارات CSS
    document.querySelectorAll('input[name="css_option"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const inlineCssCodeElement = document.getElementById('inline-css-code');
        const externalCssFileElement = document.getElementById('external-css-file');
        
        if (this.value === 'inline') {
          if (inlineCssCodeElement) inlineCssCodeElement.style.display = 'block';
          if (externalCssFileElement) externalCssFileElement.style.display = 'none';
        } else if (this.value === 'external') {
          if (inlineCssCodeElement) inlineCssCodeElement.style.display = 'none';
          if (externalCssFileElement) externalCssFileElement.style.display = 'block';
        }
      });
    });
    
    // أزرار إضافة خبرة وتعليم ومشاريع
    const addExperienceButton = document.getElementById('add-experience');
    if (addExperienceButton) {
      addExperienceButton.addEventListener('click', addExperienceEntry);
    }
    
    const addEducationButton = document.getElementById('add-education');
    if (addEducationButton) {
      addEducationButton.addEventListener('click', addEducationEntry);
    }
    
    const addProjectButton = document.getElementById('add-project');
    if (addProjectButton) {
      addProjectButton.addEventListener('click', addProjectEntry);
    }
    
    // ربط أدوات تحليل البيانات
    setupAnalyticsTools();
  }
  
  // دوال مساعدة لنموذج السيرة الذاتية
  function addExperienceEntry() {
    const experienceFields = document.getElementById('experience-fields');
    if (!experienceFields) return;
    
    const newEntry = document.createElement('div');
    newEntry.classList.add('experience-entry');
    newEntry.innerHTML = `
      <input type="text" class="company" placeholder="اسم الشركة">
      <input type="text" class="position" placeholder="المسمى الوظيفي">
      <input type="text" class="date" placeholder="تاريخ البدء - تاريخ الانتهاء">
      <textarea class="responsibilities" placeholder="المهام والمسؤوليات"></textarea>
      <button type="button" class="remove-btn remove-experience">×</button>
    `;
    experienceFields.appendChild(newEntry);
    
    newEntry.querySelector('.remove-experience').addEventListener('click', function() {
      newEntry.remove();
    });
  }
  
  function addEducationEntry() {
    const educationFields = document.getElementById('education-fields');
    if (!educationFields) return;
    
    const newEntry = document.createElement('div');
    newEntry.classList.add('education-entry');
    newEntry.innerHTML = `
      <input type="text" class="degree" placeholder="الشهادة">
      <input type="text" class="university" placeholder="اسم الجامعة">
      <input type="text" class="graduation-date" placeholder="سنة التخرج">
      <button type="button" class="remove-btn remove-education">×</button>
    `;
    educationFields.appendChild(newEntry);
    
    newEntry.querySelector('.remove-education').addEventListener('click', function() {
      newEntry.remove();
    });
  }
  
  function addProjectEntry() {
    const projectFields = document.getElementById('projects-fields');
    if (!projectFields) return;
    
    const newEntry = document.createElement('div');
    newEntry.classList.add('project-entry');
    newEntry.innerHTML = `
      <input type="text" class="project-name" placeholder="اسم المشروع">
      <textarea class="project-description" placeholder="وصف المشروع"></textarea>
      <textarea class="project-tools" placeholder="الأدوات المستخدمة"></textarea>
      <button type="button" class="remove-btn remove-project">×</button>
    `;
    projectFields.appendChild(newEntry);
    
    newEntry.querySelector('.remove-project').addEventListener('click', function() {
      newEntry.remove();
    });
  }
  
  // ربط أدوات تحليل البيانات
  function setupAnalyticsTools() {
    // تحليل المخزون
    const analyzeInventoryButton = document.getElementById('analyze-inventory');
    if (analyzeInventoryButton) {
      analyzeInventoryButton.addEventListener('click', AITools.analyzeInventory);
    }
    
    // تحليل المبيعات
    const analyzeSalesButton = document.getElementById('analyze-sales');
    if (analyzeSalesButton) {
      analyzeSalesButton.addEventListener('click', AITools.analyzeSales);
    }
    
    // إنشاء الفاتورة
    const generateInvoiceButton = document.getElementById('generate-invoice');
    if (generateInvoiceButton) {
      generateInvoiceButton.addEventListener('click', AITools.generateInvoice);
    }
    
    // توصيات التعلم
    const generateLearningPlanButton = document.getElementById('generate-learning');
    if (generateLearningPlanButton) {
      generateLearningPlanButton.addEventListener('click', AITools.generateLearningPlan);
    }
    
    // ربط باقي الأدوات هنا...
  }
  
  // تهيئة التطبيق
  function initApp() {
    setupEventListeners();
    
    // إظهار إشعار ترحيبي
    UIManager.showNotification('مرحباً بك في منصة BrightAI لأدوات الذكاء الاصطناعي', 'info');
    
    // إخفاء أزرار التنزيل في البداية
    UIManager.toggleVisibility('download-resume', false);
    UIManager.toggleVisibility('download-cover-letter', false);
    UIManager.toggleVisibility('download-search-results', false);
    UIManager.toggleVisibility('download-html', false);
  }
  
  // بدء التطبيق
  initApp();
});