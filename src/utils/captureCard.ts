// --- save an answer card as a PNG: the .capture-visible footer shows, the .no-capture buttons don't
export async function captureCard(node: HTMLElement, title: string): Promise<void> {
	const extras = node.querySelectorAll('.capture-visible');
	extras.forEach((el) => el.classList.remove('hidden'));
	node.classList.add('capturing');
	try {
		const { default: html2canvas } = await import('html2canvas');
		const canvas = await html2canvas(node, {
			ignoreElements: (element) => element.classList.contains('no-capture'),
			backgroundColor: '#02080f',
			logging: false,
		});
		const link = document.createElement('a');
		link.href = canvas.toDataURL('image/png');
		link.download = `${title.replace(/[ ]/g, '-').replace(/[^-a-zA-Z0-9]/g, '')}.png`;
		link.click();
	} finally {
		extras.forEach((el) => el.classList.add('hidden'));
		node.classList.remove('capturing');
	}
}
