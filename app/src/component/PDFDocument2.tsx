import React, { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url
).toString();

const PDFDocument2 = React.memo(({ viewData }: { viewData: any }) => {
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);

	const onDocumentLoadSuccess = ({ numPages }) => {
		setNumPages(numPages);
	};

	return (
		<div>
			<Document
				file="/assets/report_1.pdf"  // 여기서 PDF 파일 경로를 설정
				onLoadSuccess={onDocumentLoadSuccess}
			>
				<Page pageNumber={pageNumber} />
			</Document>

			<p>
				페이지 {pageNumber} / {numPages}
			</p>
			<button onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}>이전 페이지</button>
			<button onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}>다음 페이지</button>
		</div>
	);
});


export default PDFDocument2;
