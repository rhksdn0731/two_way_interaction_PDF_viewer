import React, { useMemo, useState, useEffect } from 'react';
import {
	PDFViewer,
	Page,
	Text,
	View,
	Document,
	Font,
	Image
} from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

Font.register({
	family: 'NanumMyeongjo',
	fonts: [
		{
			src: '/assets/font/NanumMyeongjo.ttf',
			fontWeight: 'normal',
		},
		{
			src: '/assets/font/NanumMyeongjoExtraBold.ttf',
			fontWeight: '800',
		},
	],
});

Font.register({
	family: 'Pretendard',
	src: '/assets/font/PretendardVariable.ttf',
});

const head = createTw({
	theme: {
		fontFamily: {
			sans: ['Pretendard'],
		},
		extend: {
			colors: {
				custom: '#bada55',
			},
		},
	},
});

const content = createTw({
	theme: {
		fontFamily: {
			sans: ['NanumMyeongjo'],
		},
		extend: {
			colors: {
				custom: '#bada55',
			},
		},
	},
});

const PDFDocument = React.memo(({ viewData }: { viewData: any }) => {
	if (viewData !== null) {
		console.log(viewData);
		console.log(viewData.pictures[0]);
	}
	const [selectedId, setSelectedId] = useState<string>(null);

	const scrollToTextBox = (id) => {
		console.log(id);
		const target = document.getElementById(id);
		if (!target) return;
		target.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	};

	const MemoizedPDF = useMemo(() => (
		<PDFViewer style={head("w-full h-screen font-sans")}>
			<Document>
				<Page size="A4">
					{viewData.body.children.map((childrenItem, idx) => (
						<View key={`childrenItem-${idx}`}>

							{viewData.pictures
								.filter(picturesItem => picturesItem.self_ref === childrenItem['$ref'])
								.map((picturesItem, idx) => (
									<Image key={`txt-${idx}`} src={picturesItem.image.uri}></Image>
								))}

							{viewData.pictures
								.filter(picturesItem => picturesItem['self_ref'] === childrenItem['$ref'])
								.map((picturesItem, idx) => {
										return (
											<img
												key={`picturesItem${idx}`}
												id={picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]}
												className={`interaction-item ${selectedId !== null && selectedId === (picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]) ? 'selectedId !== null && selectedId ===' : ''}`}
												onClick={() => scrollToTextBox(`pdf${picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]}`)}
												onMouseEnter={() => setSelectedId(`pdf${picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]}`)}
												onMouseLeave={() => setSelectedId(null)}
												src={picturesItem.image.uri}
												alt=""
											/>
										)
									}
								)}

							{viewData.texts
								.filter(t => t.parent?.['$ref'] === childrenItem['$ref'])
								.filter(t => !t.parent?.['$ref'].includes('pictures') && !t.parent?.['$ref'].includes('table'))
								.map((t, idx2) => (
									<Text key={`p-${idx2}`} style={content("font-sans")}>{t.text}</Text>
								))}

							{viewData.tables
								.filter(table => table.self_ref === childrenItem['$ref'])
								.map((tableItem, tidx) => (
									<View key={`table-${tidx}`}>
										{/* Header */}
										<View>
											<View>
												{tableItem.data.grid[0].map((cell, cIdx, arr) => {
													if (!cell || cell.row_span === 0 || cell.text === "") return null;
													if (cIdx > 0 &&
														cell.text === arr[cIdx - 1]?.text &&
														(cell.row_span ?? 1) === 1 &&
														(arr[cIdx - 1]?.row_span ?? 1) === 1
													) return null;

													return (
														<Text key={`th-${cIdx}`} style={head("font-sans")}>{cell.text}</Text>
													);
												})}
											</View>
										</View>
										{/* Body */}
										<View>
											{(() => {
												const rendered = new Set<string>();

												return tableItem.data.grid
													.filter((_, idx) => idx > 0)
													.map((row, rowIdx) => {
														const rowCells = [];
														for (let colIdx = 0; colIdx < row.length; colIdx++) {
															const cell = row[colIdx];
															if (!cell) continue;
															const key = `${rowIdx}-${colIdx}`;
															if (rendered.has(key)) continue;

															const colSpan = cell.col_span ?? 1;
															const rowSpan = cell.row_span ?? 1;

															for (let r = rowIdx; r < rowIdx + rowSpan; r++) {
																for (let c = colIdx; c < colIdx + colSpan; c++) {
																	rendered.add(`${r}-${c}`);
																}
															}

															rowCells.push(
																<View key={`cell-${rowIdx}-${colIdx}`} style={head("p-2")}>
																	<Text style={head("font-sans")}>{cell.text}</Text>
																</View>
															);
														}

														return (
															<Text key={`row-${rowIdx}`} style={head("font-sans")}>
																{rowCells}
															</Text>
														);
													});
											})()}
										</View>
									</View>
								))}
						</View>
					))}
				</Page>
			</Document>
		</PDFViewer>
	), [JSON.stringify(viewData)]);

	return (
		<section className='flex'>
			<article className="relative w-1/2">
				{viewData.texts
					.map((textsItem, idx) => {
						const bbox = textsItem.prov[0].bbox;
						const { l, b, r, t, coord_origin } = bbox;
						const width = r - l;

						const style =
							coord_origin === 'TOPLEFT'
								? {
									top: `${t}px`,
									left: `${l}px`,

									height: `${Math.abs(b - t)}px`,
									position: 'absolute',
								}
								: {
									bottom: `${b}px`,
									left: `${l}px`,
									width: `${width}px`,
									height: `${Math.abs(t - b)}px`,
									position: 'absolute',
								};

						const getId = 'pdf' + textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2];

						return (
							<button
								key={textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2]}
								id={`pdf${textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2]}`}
								style={style}
								className={`interaction-nav-btn ${selectedId !== null && selectedId === getId ? 'active' : ''}`}
								onClick={() => scrollToTextBox(textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2])}
								onMouseEnter={() => setSelectedId(textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2])}
								onMouseLeave={() => setSelectedId(null)}
							>
								{textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2]}
							</button>
						);
					})}
				{MemoizedPDF}
			</article>
			<article
				className="flex flex-col w-1/2 h-screen gap-2 px-6 p-4 overflow-y-scroll">
				{viewData.body.children.map((childrenItem, idx) => (
						<div
							key={`childrenItem${idx}`}
							id={childrenItem['$ref'].split('/')[1] + childrenItem['$ref'].split('/')[2]}
							className="flex flex-col gap-4"
						>
							{viewData.pictures
								.filter(picturesItem => picturesItem['self_ref'] === childrenItem['$ref'])
								.map((picturesItem, idx) => {
										return (
											<img
												key={`picturesItem${idx}`}
												id={picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]}
												className={`interaction-item ${selectedId !== null && selectedId === (picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]) ? 'selectedId !== null && selectedId ===' : ''}`}
												onClick={() => scrollToTextBox(`pdf${picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]}`)}
												onMouseEnter={() => setSelectedId(`pdf${picturesItem['self_ref'].split('/')[1] + picturesItem['self_ref'].split('/')[2]}`)}
												onMouseLeave={() => setSelectedId(null)}
												src={picturesItem.image.uri}
												alt=""
											/>
										)
									}
								)}

							{viewData.texts
								.filter(textsItem => textsItem.parent?.['$ref'] === childrenItem['$ref'])
								.filter(textsItem => !textsItem.parent?.['$ref'].includes('pictures'))
								.filter(textsItem => !textsItem.parent?.['$ref'].includes('table'))
								.map((textsItem, idx) => {
										return (
											<button
												type="button"
												key={`${textsItem['self_ref'].split('/')[2]}${idx}`}
												id={textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2]}
												className={`interaction-item ${selectedId !== null && selectedId === (textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2]) ? 'selectedId !== null && selectedId ===' : ''}`}
												onClick={() => scrollToTextBox(`pdf${textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2]}`)}
												onMouseEnter={() => setSelectedId(`pdf${textsItem['self_ref'].split('/')[1] + textsItem['self_ref'].split('/')[2]}`)}
												onMouseLeave={() => setSelectedId(null)}
											>
												{textsItem['text']}
											</button>
										)
									}
								)}

							{viewData.tables
								.filter(tableItem => tableItem['self_ref'] === childrenItem['$ref'])
								.map((tableItem, idx) => {
										return (
											<table
												key={`tableItem${idx}`}
												id={tableItem['self_ref'].split('/')[1] + tableItem['self_ref'].split('/')[2]}
												className={`interaction-item ${selectedId !== null && selectedId === (tableItem['self_ref'].split('/')[1] + tableItem['self_ref'].split('/')[2]) ? 'selectedId !== null && selectedId ===' : ''}`}
												onClick={() => scrollToTextBox(`pdf${tableItem['self_ref'].split('/')[1] + tableItem['self_ref'].split('/')[2]}`)}
												onMouseEnter={() => setSelectedId(`pdf${tableItem['self_ref'].split('/')[1] + tableItem['self_ref'].split('/')[2]}`)}
												onMouseLeave={() => setSelectedId(null)}
											>
												<thead>
												<tr>
													{tableItem['data'].grid[0].map((cell, idx, arr) => {
														// 병합 처리로 생략된 셀은 건너뜀
														if (!cell || cell.row_span === 0 || cell.text === "") return null;

														// 앞 셀과 텍스트가 같고 row_span이 1이라면 중복으로 간주하고 생략
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
													const rendered = new Set<string>(); // ✅ tbody 전체에서 재사용

													return tableItem['data'].grid
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
																		className={cell?.row_header ? 'row-header' : ''}
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
																	className='text-right'
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
						</div>
					)
				)}
			</article>
		</section>
	);
});

export default PDFDocument;
