import PlainDraggable from 'plain-draggable'
import crel from 'crel'

let count = 0

const createNode = (name = `node #${count}`) => {
	let element = crel(
		'div',
		{ class: 'node' },
		crel('div', { class: 'node-header', id: `handle${count}` }, name),
		crel(
			'div',
			{ class: 'dots' },
			crel('div', { class: 'dot-left' }),
			crel('div', { class: 'dot-right' })
		),
		crel(
			'div',
			{ class: 'node-body' },
			crel(
				'div',
				crel('label', { for: `num${count}` }, 'num '),
				crel('input', { type: 'number', name: `num${count}`, value: 3 })
			)
		)
	)
	document.getElementsByClassName('area')[0].appendChild(element)
	const draggable = new PlainDraggable(element, {
		handle: document.getElementById(`handle${count}`),
	})
	count++
}

createNode()
createNode()
