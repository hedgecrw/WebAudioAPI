/**
 * Module containing functionality to create and utilize {@link WebAudioAPI} audio analyzers.
 * @module Analysis
 */

import { AnalysisType } from './Constants.mjs';
import { PowerSpectrum } from '../analyses/PowerSpectrum.mjs';
import { TotalPower } from '../analyses/TotalPower.mjs';

const AnalysisClasses = {
   [AnalysisType.PowerSpectrum]: PowerSpectrum,
   [AnalysisType.TotalPower]: TotalPower
};

/**
 * Returns a concrete analyzer implementation for the specified analysis type. The value passed
 * to the `analysisType` parameter must be the **numeric value** associated with a certain
 * {@link module:Constants.AnalysisType AnalysisType}, not a string-based key.
 * 
 * @param {number} analysisType - Numeric value corresponding to the desired {@link module:Constants.AnalysisType AnalysisType}
 * @returns {AnalysisBase} Concrete analyzer implementation for the specified {@link module:Constants.AnalysisType AnalysisType}
 * @see {@link module:Constants.AnalysisType AnalysisType}
 * @see {@link AnalysisBase}
 */
export function getAnalyzerFor(analysisType) {
   return new AnalysisClasses[analysisType];
}
