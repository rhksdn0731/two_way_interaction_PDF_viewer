import { Link } from 'react-router-dom';

const App = () => {

  return (
		<section className='flex justify-center w-full h-screen default-padding'>
			<article className='flex flex-col justify-center items-center gap-8'>
				<h2 className='text-4xl font-bold'>
					Two-Way-Interaction-PDF-Viewer
				</h2>
				<Link
					to={'/pdf-viewer/1'}
					className='flex rounded-lg border border-blue-100 text-white px-4 py-2 hover:bg-blue-200 transirion-all duration-150 ease-in-out'
				>
					open pdf viewer
				</Link>
			</article>
		</section>
	)
}

export default App
