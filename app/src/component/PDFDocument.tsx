import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('/assets/pdf.worker.min.js', import.meta.url).toString();

interface BBox {
	l: number;
	t: number;
	r: number;
	b: number;
	coord_origin: string;
}

interface TextItem {
	self_ref: string;
	parent: { $ref: string };
	children: any[];
	content_layer: string;
	label: string;
	prov: Array<{
		page_no: number;
		bbox: BBox;
		charspan: [number, number];
	}>;
	orig: string;
	text: string;
}

interface PictureItem {
	self_ref: string;
	parent: { $ref: string };
	children: Array<{ $ref: string }>;
	content_layer: string;
	label: string;
	prov: Array<{
		page_no: number;
		bbox: BBox;
		charspan: [number, number];
	}>;
	captions: any[];
	references: any[];
	footnotes: any[];
	image: {
		mimetype: string;
		dpi: number;
		size: {
			width: number;
			height: number;
		};
		uri: string;
	};
	annotations: any[];
}

interface GroupItem {
	self_ref: string;
	parent: { $ref: string };
	children: Array<{ $ref: string }>;
	content_layer: string;
	name: string;
	label: string;
}

interface TableCell {
	bbox: BBox;
	row_span: number;
	col_span: number;
	start_row_offset_idx: number;
	end_row_offset_idx: number;
	start_col_offset_idx: number;
	end_col_offset_idx: number;
	text: string;
	column_header: boolean;
	row_header: boolean;
	row_section: boolean;
}

interface TableItem {
	self_ref: string;
	parent: { $ref: string };
	children: any[];
	content_layer: string;
	label: string;
	prov: Array<{
		page_no: number;
		bbox: BBox;
		charspan: [number, number];
	}>;
	captions: any[];
	references: any[];
	footnotes: any[];
	data: {
		table_cells: TableCell[];
		num_rows: number;
		num_cols: number;
		grid: TableCell[];
	};
}

interface BodyItem {
	self_ref: string;
	children: Array<{ $ref: string }>;
	content_layer: string;
	name: string;
	label: string;
}

interface ViewData {
	body: BodyItem;
	groups: GroupItem[];
	texts: TextItem[];
	pictures: PictureItem[];
	tables: TableItem[];
}

const PDFDocument: React.FC<{ viewData: ViewData }> = React.memo(({ viewData }) => {
	const [pageNumber, setPageNumber] = useState(1);
	const [selectedId, setSelectedId] = useState<string>(null);

	const scrollToTextBox = (id) => {
		const target = document.getElementById(id);
		if (!target) return;
		target.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	};

	const prependTextToTable = (targetId: string, appendTargetId: string)=> {
		const target = document.getElementById(targetId);
		const prependTarget = document.getElementById(appendTargetId);

		if (target && prependTarget) {
			target.prepend(prependTarget);
		}
	}

	const prependButtonsToPictures = (buttonList: string[], targetId: string) => {
		const target = document.getElementById(targetId);

		if (!target) {
			console.error('#pictures1 요소를 찾을 수 없습니다.');
			return;
		}

		buttonList.forEach(id => {
			const buttonId = document.getElementById(id);
			if (buttonId ) {
				target.prepend(buttonId);
			}
		});
	}

	const elRefs = useRef<Record<string, HTMLElement | null>>({});
	const addActive = (id?: string) => elRefs.current[id]?.classList.add("active");
	const removeActive = (id?: string) => elRefs.current[id]?.classList.remove("active");

	const onEnterPair = (id: string) => {
		addActive(id);
		addActive(`${id}pdf`);
	};
	const onLeavePair = (id: string) => {
		removeActive(id);
		removeActive(`${id}pdf`);
	};

	const buttonList1: string[] = [
		'texts29', 'texts30', 'texts31', 'texts32', 'texts33', 'texts34', 'texts35',
		'texts36', 'texts37', 'texts38', 'texts39', 'texts40', 'texts42', 'texts43',
		'texts44', 'texts45', 'texts46', 'texts47', 'texts48', 'texts49', 'texts50',
		'texts52', 'texts53', 'texts57', 'texts58', 'texts59', 'texts60', 'texts63',
		'texts64', 'texts65', 'texts66', 'texts67', 'texts68', 'pictures1'
	];

	const buttonList2: string[] = [
		'texts57', 'texts58', 'texts59', 'texts60', 'texts63', 'texts64', 'texts65', 'texts66',
		'texts67', 'texts68', 'texts69', 'texts70', 'texts72', 'texts73', 'texts74', 'texts75',
		'texts76', 'texts77', 'texts78', 'texts79', 'texts80', 'texts82', 'texts83', 'texts84',
		'texts85', 'texts86', 'texts87', 'texts88', 'texts89', 'texts90', 'pictures2'
	];

	useEffect(() => {
		prependTextToTable( 'texts23','tables0');
		prependTextToTable('texts26','tables1');
		prependTextToTable('texts55','picWrap1');
		prependTextToTable('texts91','picWrap2');
		prependButtonsToPictures(buttonList1,'picWrap1');
		prependButtonsToPictures(buttonList2,'picWrap2');
	}, []);

	return (
		<section className="flex p-10 flex-col sm:flex-row">
			<article className="relative w-full sm:w-1/2">
				<div className="w-full">
					<Document
						file="/assets/report_1.pdf"
					>
						<Page
							pageNumber={pageNumber}
							className="custom-pdf-page"
						/>
					</Document>
				</div>

				<div id='picWrap1'></div>
				<div id='picWrap2'></div>

				<article
					className="absolute -top-24 left-0 flex flex-col w-full h-screen">
					{viewData.texts.map((textsItem, idx) => {
						if (!textsItem?.prov?.[0]?.bbox) return null;

						const {l, r, t, b, coord_origin} = textsItem.prov[0].bbox;
						const width = Math.abs(r - l);
						const height = Math.abs(t - b);
						const textsItemId = textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2];

						const style =
							coord_origin === "BOTTOMLEFT"
								? {
									left: `${l}px`,
									bottom: `${b}px`,
									width: `${width}px`,
									height: `${height}px`,
								}
								: {
									left: `${l}px`,
									top: `${t}px`,
									width: `${width}px`,
									height: `${height}px`,
								};

						return (
							<button
								key={textsItemId}
								ref={(el) => (elRefs.current[`${textsItemId}pdf`] = el)}
								type='button'
								id={`${textsItemId}pdf`}
								style={style}
								className={
									`absolute interaction-nav-btn !text-xs white-pre text-left z-4 !p-2
										${selectedId !== null && `${selectedId}pdf` === `${textsItemId}pdf` ? 'active' : ''}`
								}
								onClick={() => scrollToTextBox(`${textsItemId}`)}
								onMouseEnter={() => onEnterPair(`${`${textsItemId}`}`)}
								onMouseLeave={() => onLeavePair(`${`${textsItemId}`}`)}
							></button>
						);
					})}
				</article>
			</article>

			<article className="flex flex-wrap w-full sm:w-1/2 px-6 p-4">
				{viewData.texts
					.filter((textsItem, idx) => !(idx >= 10 && textsItem.parent?.["$ref"].includes("pictures")))
					.map((textsItem, idx) => {
							const textsItemId = `${textsItem["self_ref"].split("/")[1] + textsItem["self_ref"].split("/")[2]}`;

							return (
								<button
									key={`${textsItem["self_ref"].split("/")[2]}${idx}`}
									ref={(el) => (elRefs.current[textsItemId] = el)}
									type="button"
									id={textsItemId}
									className={`relative interaction-item py-1 ${selectedId !== null && selectedId === textsItemId ? "active" : ""}  ${textsItem['label']}`}
									onClick={() => scrollToTextBox(`${textsItemId}pdf`)}
									onMouseEnter={() => onEnterPair(textsItemId)}
									onMouseLeave={() => onLeavePair(textsItemId)}
								>
									<span>{textsItem["text"]}</span>
								</button>
							)
						}
					)}

				{viewData.pictures
					.filter((picturesItem, idx) => idx > 0)
					.map((picturesItem, idx) => {
							const picturesId = picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2];
							const selectedPictureId = picturesId === 'pictures1' ? 'texts27' : 'texts56';

							return (
								<img
									key={`picturesItem${idx}`}
									ref={(el) => (elRefs.current[picturesItem] = el)}
									id={picturesId}
									className={`interaction-item ${selectedId !== null && selectedId === picturesId ? 'selectedId !== null && selectedId ===' : ''}`}
									onClick={() => scrollToTextBox(`${selectedPictureId}pdf`)}
									onMouseEnter={() => onEnterPair(selectedPictureId)}
									onMouseLeave={() => onLeavePair(selectedPictureId)}
									src={picturesItem.image.uri}
								/>
							)
						}
					)}

				{viewData.texts
					.filter(textsItem => !textsItem?.["self_ref"].includes("1"))
					.filter(textsItem => !textsItem?.["self_ref"].includes("28"))
					.filter(textsItem => !textsItem?.["self_ref"].includes("62"))
					.filter(textsItem => !textsItem?.parent["$ref"].includes("body"))
					.filter(textsItem => !textsItem?.parent["$ref"].includes("groups"))
					.map((textsItem, idx) => {
							const textsItemId = `${textsItem["self_ref"].split("/")[1] + textsItem["self_ref"].split("/")[2]}`;

							return (
								<button
									key={`${textsItem["self_ref"].split("/")[2]}${idx}`}
									ref={(el) => (elRefs.current[textsItemId] = el)}
									type="button"
									id={textsItemId}
									className={`interaction-item py-1 ${selectedId !== null && selectedId === textsItemId ? "active" : ""}  ${textsItem['label']}`}
									onClick={() => scrollToTextBox(`${textsItemId}pdf`)}
									onMouseEnter={() => onEnterPair(textsItemId)}
									onMouseLeave={() => onLeavePair(textsItemId)}
								>
									{textsItem["text"]}
								</button>
							)
						}
					)}

				{viewData.tables
					.map((tableItem, idx) => {
							const tableItemId = `${tableItem["self_ref"].split("/")[1] + tableItem["self_ref"].split("/")[2]}`;
							const selectedTableItemId = tableItemId === 'tables0' ? 'texts21' : 'texts24';

							return (
								<table
									key={`tableItem${idx}`}
									ref={(el) => (elRefs.current[tableItem] = el)}
									id={tableItemId}
									className={`interaction-item ${selectedId !== null && selectedId === tableItemId ? "active" : ""}`}
									onClick={() => scrollToTextBox(`${selectedTableItemId}pdf`)}
									onMouseEnter={() => onEnterPair(selectedTableItemId)}
									onMouseLeave={() => onLeavePair(selectedTableItemId)}
								>
									<thead>
									<tr>
										{tableItem["data"].grid[0].map((cell, idx, arr) => {
											if (!cell || cell.row_span === 0 || cell.text === "") return null;

											if (
												idx > 0 &&
												cell.text === arr[idx - 1]?.text &&
												(cell.row_span ?? 1) === 1 &&
												(arr[idx - 1]?.row_span ?? 1) === 1
											) {
												return null;
											}

											return (
												<th
													key={`th-${idx}`}
													rowSpan={cell.row_span > 1 ? cell.row_span : undefined}
													colSpan={cell.col_span > 1 ? cell.col_span : undefined}
													className={`text-center ${cell?.column_header ? "column-header" : ""}`}
												>
													{cell.text}
												</th>
											);
										})}
									</tr>
									</thead>
									<tbody>
									{(() => {
										const rendered = new Set<string>();

										return tableItem["data"].grid
											.filter((_, idx) => idx > 0)
											.map((gridItem, rowIdx) => {
												const rowCells = [];

												for (let colIdx = 0; colIdx < gridItem.length; colIdx++) {
													const cell = gridItem[colIdx];
													if (!cell) continue;

													const cellKey = `${rowIdx}-${colIdx}`;
													if (rendered.has(cellKey)) continue;

													const colSpan = cell.col_span ?? 1;
													const rowSpan = cell.row_span ?? 1;

													for (let r = rowIdx; r < rowIdx + rowSpan; r++) {
														for (let c = colIdx; c < colIdx + colSpan; c++) {
															rendered.add(`${r}-${c}`);
														}
													}

													rowCells.push(
														<td
															key={`cell-${rowIdx}-${colIdx}`}
															className={cell?.row_header ? "row-header" : ""}
															colSpan={colSpan > 1 ? colSpan : undefined}
															rowSpan={rowSpan > 1 ? rowSpan : undefined}
														>
															{cell.text}
														</td>
													);
												}

												return (
													<tr
														key={`row-${rowIdx}`}
														className="text-right"
													>
														{rowCells}
													</tr>
												);
											});
									})()}
									</tbody>
								</table>
							)
						}
					)}
			</article>
		</section>
	);
});

export default PDFDocument;
