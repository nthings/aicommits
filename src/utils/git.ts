import { execa } from 'execa';
import { KnownError } from './error.js';

export const assertGitRepo = async () => {
	const { stdout } = await execa('git', ['rev-parse', '--is-inside-work-tree'], { reject: false });

	if (stdout !== 'true') {
		throw new KnownError('The current directory must be a Git repository!');
	}
};

const excludeFromDiff = [
	'package-lock.json',
	'pnpm-lock.yaml',

	// yarn.lock, Cargo.lock, Gemfile.lock, Pipfile.lock, etc.
	'*.lock',
].map(file => `:(exclude)${file}`);

export const getStagedDiff = async () => {
	const diffCached = ['diff', '--cached'];
	const { stdout: files } = await execa(
		'git',
		[...diffCached, '--name-only', ...excludeFromDiff],
	);

	if (!files) {
		return;
	}

	const { stdout: diff } = await execa(
		'git',
		[...diffCached, ...excludeFromDiff],
	);

	return {
		files: files.split('\n'),
		diff,
	};
};

export const getDetectedMessage = (files: string[]) => `Detected ${files.length.toLocaleString()} staged file${files.length > 1 ? 's' : ''}`;
