import React, { useState, useCallback, useEffect } from 'react';
import { Difficulty, ExamType, Exam, Question, UserAnswers, CorrectionResult, HistoryItem } from '../../types';
import { generateExam, correctExam, fileToGenerativePart } from '../../services/gemini';
import Loader from '../Loader';
import { UploadIcon, ClipboardIcon, DownloadIcon, CheckIcon, HistoryIcon, TrashIcon } from '../Icons';
import { copyToClipboard, downloadPdf, downloadDocx } from '../../utils/fileUtils';


const SettingsPanel = ({ difficulty, setDifficulty, examType, setExamType, sourceText, setSourceText, setFile, handleGenerate, isLoading, file }: {
    difficulty: Difficulty;
    setDifficulty: (d: Difficulty) => void;
    examType: ExamType;
    setExamType: (e: ExamType) => void;
    sourceText: string;
    setSourceText: (s: string) => void;
    setFile: (f: File | null) => void;
    handleGenerate: () => void;
    isLoading: boolean;
    file: File | null;
}) => (
    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-lg animate-fade-in-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">مستوى الصعوبة</label>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    {Object.values(Difficulty).map(d => (
                        <button key={d} onClick={() => setDifficulty(d)} className={`px-4 py-2 text-sm rounded-md transition-all duration-200 w-full ${difficulty === d ? 'bg-slate-500 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600'}`}>{d}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">نوع الامتحان</label>
                <select value={examType} onChange={e => setExamType(e.target.value as ExamType)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-slate-500 focus:border-slate-500">
                    {Object.values(ExamType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>

        <div className="mt-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">المادة المصدر</label>
            <textarea
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                placeholder="الصق النص هنا، أو قم بتحميل ملف بالأسفل..."
                className="w-full h-32 bg-gray-900/50 border border-slate-600 rounded-md p-3 text-gray-200 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            />
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <label htmlFor="file-upload" className="flex-1 w-full sm:w-auto cursor-pointer bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors">
                <UploadIcon />
                <span className="mr-2">{file ? file.name : 'تحميل ملف أو صورة'}</span>
            </label>
            <input id="file-upload" type="file" className="hidden" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
            
            <button onClick={handleGenerate} disabled={isLoading || (!sourceText && !file)} className="w-full sm:w-auto bg-gradient-to-r from-slate-500 to-slate-700 text-white font-bold py-2 px-8 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity transform hover:scale-105 shadow-lg">
                إنشاء
            </button>
        </div>
    </div>
);

const ExamTaker = ({ exam, userAnswers, setUserAnswers, handleCorrection, correctionResult, isCorrecting }: {
    exam: Exam;
    userAnswers: UserAnswers;
    setUserAnswers: (answers: UserAnswers) => void;
    handleCorrection: () => void;
    correctionResult: CorrectionResult | null;
    isCorrecting: boolean;
}) => {
    const handleAnswerChange = (qIndex: number, answer: string | boolean) => {
        setUserAnswers({ ...userAnswers, [qIndex]: answer });
    };

    const getFeedbackClass = (qIndex: number) => {
        if (!correctionResult) return 'border-slate-700';
        const feedback = correctionResult.feedback.find(f => f.questionIndex === qIndex);
        return feedback?.isCorrect ? 'border-green-500' : 'border-red-500';
    };

    return (
        <div id="exam-content" className="space-y-6">
            <h2 className="text-3xl font-orbitron text-center text-slate-300">{exam.title}</h2>
            {exam.questions.map((q, qIndex) => (
                <div key={qIndex} className={`bg-gray-800/60 p-5 rounded-lg border-r-4 transition-colors ${getFeedbackClass(qIndex)}`}>
                    <p className="font-semibold mb-3">س{qIndex + 1}: {q.question}</p>
                    {q.type === 'multiple-choice' && q.options && (
                        <div className="space-y-2">
                            {q.options.map((option, oIndex) => (
                                <label key={oIndex} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                                    <input type="radio" name={`q-${qIndex}`} value={option} checked={userAnswers[qIndex] === option} onChange={() => handleAnswerChange(qIndex, option)} disabled={!!correctionResult} className="form-radio text-slate-500 bg-gray-700 border-gray-600 focus:ring-slate-500" />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {q.type === 'fill-in-the-blank' && (
                        <input type="text" value={(userAnswers[qIndex] as string) || ''} onChange={e => handleAnswerChange(qIndex, e.target.value)} disabled={!!correctionResult} className="w-full sm:w-1/2 bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-slate-500 focus:border-slate-500" />
                    )}
                    {q.type === 'true-false' && (
                        <div className="flex space-x-4 rtl:space-x-reverse">
                           <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                               <input type="radio" name={`q-${qIndex}`} checked={userAnswers[qIndex] === true} onChange={() => handleAnswerChange(qIndex, true)} disabled={!!correctionResult} className="form-radio text-slate-500 bg-gray-700 border-gray-600 focus:ring-slate-500"/>
                               <span>صح</span>
                           </label>
                            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                               <input type="radio" name={`q-${qIndex}`} checked={userAnswers[qIndex] === false} onChange={() => handleAnswerChange(qIndex, false)} disabled={!!correctionResult} className="form-radio text-slate-500 bg-gray-700 border-gray-600 focus:ring-slate-500"/>
                               <span>خطأ</span>
                           </label>
                        </div>
                    )}
                     {q.type === 'short-answer' && (
                        <textarea value={(userAnswers[qIndex] as string) || ''} onChange={e => handleAnswerChange(qIndex, e.target.value)} disabled={!!correctionResult} className="w-full h-24 bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-slate-500 focus:border-slate-500" />
                    )}
                    {correctionResult && (
                        <div className="mt-3 p-3 rounded-md bg-gray-900/50 text-sm">
                            <p><strong>الإجابة الصحيحة:</strong> {String(correctionResult.feedback.find(f=>f.questionIndex===qIndex)?.correctAnswer).replace('True', 'صح').replace('False', 'خطأ')}</p>
                            <p className="mt-1 text-gray-400"><strong>الشرح:</strong> {correctionResult.feedback.find(f=>f.questionIndex===qIndex)?.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
            {!correctionResult ? (
                <div className="text-center pt-4">
                    <button onClick={handleCorrection} disabled={isCorrecting} className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-8 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity transform hover:scale-105 shadow-lg">
                        {isCorrecting ? 'جاري التصحيح...' : 'إرسال للتصحيح'}
                    </button>
                </div>
            ) : (
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-2xl font-orbitron">النتيجة النهائية: {correctionResult.score} / {correctionResult.total}</h3>
                </div>
            )}
        </div>
    );
};

const HistoryPanel = ({ history, loadHistory, deleteHistory }: { history: HistoryItem<Exam>[], loadHistory: (item: HistoryItem<Exam>) => void, deleteHistory: (id: string) => void }) => (
    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-lg animate-fade-in-slide-up">
        <h3 className="text-xl font-orbitron text-slate-300 mb-4 flex items-center"><HistoryIcon /><span className="mr-2">سجل الإنشاءات</span></h3>
        {history.length === 0 ? (
            <p className="text-slate-400">لا يوجد اختبارات محفوظة بعد.</p>
        ) : (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {history.map(item => (
                    <li key={item.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                        <button onClick={() => loadHistory(item)} className="text-right flex-grow">
                            <span className="font-semibold text-slate-200 block">{item.title}</span>
                            <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                        </button>
                        <button onClick={() => deleteHistory(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors">
                            <TrashIcon />
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);


const ExamGenerator: React.FC = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
    const [examType, setExamType] = useState<ExamType>(ExamType.MultipleChoice);
    const [sourceText, setSourceText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [exam, setExam] = useState<Exam | null>(null);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCorrecting, setIsCorrecting] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<HistoryItem<Exam>[]>([]);

    const HISTORY_KEY = 'exam_history';

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
        }
    }, []);

    const saveToHistory = (examToSave: Exam) => {
        const newItem: HistoryItem<Exam> = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            title: examToSave.title,
            type: 'exam',
            data: examToSave
        };
        setHistory(prev => {
            const newHistory = [newItem, ...prev].slice(0, 10); // Keep latest 10
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const loadFromHistory = (item: HistoryItem<Exam>) => {
        setExam(item.data);
        setUserAnswers({});
        setCorrectionResult(null);
    };

    const deleteFromHistory = (id: string) => {
        setHistory(prev => {
            const newHistory = prev.filter(item => item.id !== id);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setExam(null);
        setCorrectionResult(null);
        setUserAnswers({});
        try {
            let source: string | { inlineData: { data: string; mimeType: string } };
            if (file) {
                source = await fileToGenerativePart(file);
            } else {
                source = sourceText;
            }
            const generated = await generateExam(difficulty, examType, source);
            setExam(generated);
            saveToHistory(generated);
        } catch (e: any) {
            setError(e.message || 'حدث خطأ أثناء إنشاء الاختبار.');
        }
        setIsLoading(false);
    }, [difficulty, examType, sourceText, file]);
    
    const handleCorrection = useCallback(async () => {
        if (!exam) return;
        setIsCorrecting(true);
        setError('');
        try {
            const result = await correctExam(exam, userAnswers);
            setCorrectionResult(result);
        } catch (e: any) {
             setError(e.message || 'حدث خطأ أثناء التصحيح.');
        }
        setIsCorrecting(false);
    }, [exam, userAnswers]);
    
    const handleCopy = () => {
        const examText = document.getElementById('exam-content')?.innerText || '';
        copyToClipboard(examText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <SettingsPanel 
                    difficulty={difficulty} setDifficulty={setDifficulty}
                    examType={examType} setExamType={setExamType}
                    sourceText={sourceText} setSourceText={setSourceText}
                    file={file} setFile={setFile}
                    handleGenerate={handleGenerate} isLoading={isLoading}
                />
                {error && <div className="p-4 bg-red-500/20 text-red-300 border border-red-500 rounded-md text-right animate-fade-in-slide-up">{error}</div>}
                
                {isLoading && <Loader text="جاري صياغة الاختبار..." />}

                {exam && (
                    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700/50 shadow-lg animate-fade-in-slide-up">
                        <div className="flex justify-end space-x-2 rtl:space-x-reverse mb-4">
                            <button onClick={handleCopy} className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                               {copied ? <CheckIcon /> : <ClipboardIcon />}<span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
                            </button>
                            <button onClick={() => downloadPdf('exam-content', exam.title)} className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors flex items-center space-x-2 rtl:space-x-reverse"><DownloadIcon /><span>PDF</span></button>
                            <button onClick={() => downloadDocx('exam-content', exam.title)} className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors flex items-center space-x-2 rtl:space-x-reverse"><DownloadIcon /><span>Word</span></button>
                        </div>
                        <ExamTaker 
                            exam={exam} 
                            userAnswers={userAnswers}
                            setUserAnswers={setUserAnswers}
                            handleCorrection={handleCorrection}
                            correctionResult={correctionResult}
                            isCorrecting={isCorrecting}
                        />
                    </div>
                )}
            </div>
            <div className="lg:col-span-1">
                <HistoryPanel history={history} loadHistory={loadFromHistory} deleteHistory={deleteFromHistory} />
            </div>
        </div>
    );
};

export default ExamGenerator;
