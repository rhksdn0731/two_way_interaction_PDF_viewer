import React, { useEffect, useState, useMemo } from 'react';

import PDFDocument from "./component/PDFDocument.tsx";

const PDFDisplay = () => {
	const [viewData, setViewData] = useState <any | null> (null);

	useEffect(()=>{
		fetch('/assets/report_1.json')
			.then((response) => response.json())
			.then(setViewData)
			.catch((err) => {
				console.error('데이터 로드 실패:',err)
			});
	},[]);

	const memoizedViewData = useMemo(() => viewData, [JSON.stringify(viewData)]);

	if (!viewData) return <p>로딩 중...</p>;

	return (
		<div className="w-full h-screen">
			<PDFDocument viewData={memoizedViewData} />
		</div>
	);
};

export default PDFDisplay;
