import React, { Component } from 'react'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import icons from '../amenities'
import { Levels } from './route-diagram'
import RouteLabel from './route-label'
import stopsByDirection from '../../test/route-73.json'

const DIRECTIONS = {
	N: 'Northbound',
	S: 'Southbound',
	E: 'Eastbound',
	W: 'Westbound'
}

const COLSPAN = 7

function getLetterGrade (score) {
	if (score >= 90) return 'A'
	else if (score >= 70) return 'B'
	else if (score >= 50) return 'C'
	else if (score >= 30) return 'D'
	else return 'F'
}

function pct(n, count) {
	return `${(n / count * 100).toFixed(1)}%`	
}

/**
 * Returns street name to a standardized nomenclature,
 * without quadrants (NE, NW...), extra spaces, and typos fixed.
 */
function normalizeStreet(streetName) {
	// Replace extra spaces, pky-> pkwy.
	var result = streetName.trim()
	.replace("  ", " ")
	.replace(" PKY", " PKWY");

	// Remove quadrants
	var quadrants = [" NW", " NE", " SE", " SW"];
	quadrants.forEach(function(q) {
		if (result.endsWith(q)) {
			result = result.substring(0, result.length - q.length);
		}
	});
	return result;
}

function getPatternIndexesForStop(stopId, allSeqs) {
	const result = [];

	allSeqs.forEach((s, i) => {
		var stopIndex = s.findIndex(st => st.id == stopId);
		if (stopIndex > -1) {
			result.push({
				sequence: i,
				stopIndex: stopIndex
			});
		}
	});

	return result;
}

class Route extends Component {
  renderRouteDiagram = (directionObj) => {
    const allSeqs = Object.values(directionObj.shapes)
    .map(sh => sh.stops)
    .sort((a1, a2) => a2.length - a1.length) // length desc.
    
    // Start from a stop sequence (pick the first one).
  
    // Holds drawing status, including the last own stops drawn for each shape
    // (so we can resume drawing)
    const lastDrawnStatuses = allSeqs.map(() => ({
      index: -1,
      status: "not-started"
    }));
    const status = {
      currentStreet: null,
      lastDivergencePatterns: null,
      lastDrawnStatuses,
      previousStreet: null
    }
    const stats = {
      accessible: 0,
      crosswalk: 0,
      trafficLight: 0,
      seating: 0,
      shelter: 0,
      trash: 0,
      stopCount: 0,
      surveyedCount: 0,
      totalScore: 0
    };

    const diagram = this.drawRouteBranchContents(allSeqs, 0, 0, status, stats)
    const n = stats.surveyedCount
    const stopListStats = (
      <tr className="stats-row">
        <td><p>{pct(stats.accessible, n)}</p></td>
        <td><p>{pct(stats.trafficLight, n)}</p></td>
        <td><p>{pct(stats.crosswalk, n)}</p></td>
        <td><p>{pct(stats.seating, n)}</p></td>
        <td><p>{pct(stats.shelter, n)}</p></td>
        <td><p>{pct(stats.trash, n)}</p></td>
        <td>{getLetterGrade(stats.totalScore / stats.surveyedCount)}</td>
        <td>{stats.surveyedCount}/{stats.stopCount} stops ({pct(stats.surveyedCount, stats.stopCount)}) surveyed</td>
      </tr>
    )
  
    return (
      <>
        {stopListStats}
        {diagram}
      </>
    );
  }

  drawRouteBranchContents = (allSeqs, index, level, status, stats) => {
    if (["divergence-no-branch", "before-convergence", "before-convergence-parallel"
      ].indexOf(status.lastDrawnStatuses[index].status) > -1) return null
  
    console.log(`Drawing branch ${index} at level ${level}`)
    
    const seq_i = allSeqs[index];
    
    // Previous pattern indexes that also have this stop.
    var prevPatternsForStop = [];
    var firstIndex = status.lastDrawnStatuses[index].index + 1;
    let returnRequested = false;
    
    return seq_i.map((stop, j) => {
      if (j < firstIndex || j > seq_i.length - 1 || returnRequested) return null

      const stopId = stop.id
      // Compute number of patterns for this stop
      var patternsForStop = getPatternIndexesForStop(stopId, allSeqs);

      let otherBranches = null
      let currentStop = null
  
      // On the first stop, if it is just a few stops skipped, don't draw.
      if (j == firstIndex) {
        var isStopSkip = status.lastDivergencePatterns && patternsForStop.length == status.lastDivergencePatterns.length; // Maybe check seq numbers too.
        if (isStopSkip) {
          status.lastDrawnStatuses[index].status = "before-convergence";
  
          // Also set this status to parallel patterns at higher indexes
          status.lastDivergencePatterns.forEach(p => {
            if (p.sequence > index) status.lastDrawnStatuses[p.sequence].status = "divergence-no-branch";
          });
  
          returnRequested = true
          return null
        }
      }
  
      // If pattern has not changed or if this is the first stop we print,
      // then just print the stop.
      // If number of patterns is less, then it is a divergence.
      // Continue with other patterns first.
      var isDivergence = patternsForStop.length < prevPatternsForStop.length && prevPatternsForStop.length != 0;
  
      if (j == 0 || patternsForStop.length == prevPatternsForStop.length || prevPatternsForStop.length == 0 || isDivergence) {
        if (isDivergence) {
          console.log('Processing divergence', prevPatternsForStop)
          status.lastDivergencePatterns = prevPatternsForStop;
  
          // Draw other patterns first on higher levels from the divergence index
          // that are not on the current pattern and that are not at a terminus.
          var patternsToDraw = [];
          prevPatternsForStop.forEach(p => {
            if (p.stopIndex == allSeqs[p.sequence].length - 1 ||
               p.sequence <= index || patternsForStop.find(p0 => p0.sequence == p.sequence)) {
              status.lastDrawnStatuses[p.sequence].status = "divergence-no-branch";
            }
            else if (p.sequence > index) {
              patternsToDraw.push(p);
              status.lastDrawnStatuses[p.sequence].index = p.stopIndex;
            }
          });
  
          if (patternsToDraw.length) {
            const junction = (
              <tr key={`${stopId}-divergence`}>
                <td colSpan={COLSPAN}></td>
                <td>
                  <span className="diagram-container">
                    <span className="diagram-line">					
                      <span className="divergence junction"></span>
                      <span className="divergence curve"></span>
                    </span>
                  </span>
                </td>
              </tr>
            )
    
            var levelOffset = 1;
            const branches = patternsToDraw.map(p => {
              //levelOffset++;
              return this.drawRouteBranchContents(allSeqs, p.sequence, level + levelOffset, status, stats);
            });

            otherBranches = (
              <>
                {junction}
                {branches}
              </>
            )
          }
        }
  
        var higherLevels = 0;
        if (status.lastDivergencePatterns) {
          higherLevels = status.lastDivergencePatterns.filter(
            p => p.sequence > level
              && status.lastDrawnStatuses[p.sequence]
              && status.lastDrawnStatuses[p.sequence].status == 'before-convergence'
          ).length;
        }
  
        var isTerminus = false;
        patternsForStop.forEach(p => {
          if (p.stopIndex == allSeqs[p.sequence].length - 1) {
            // If at least one pattern does not continue past this stop,
            // render this stop as intermediate terminus,
            // and do not render pattern.
            isTerminus = true;
            status.lastDrawnStatuses[p.sequence].status = "divergence-no-branch";
          }
        });
  
        currentStop = this.printStopContent(seq_i, j, level, higherLevels, isTerminus, status, stats);
  
        // Update drawing status for patterns coming after the one we are drawing.
        patternsForStop.forEach(p => {
          if (p.sequence >= index) {
            status.lastDrawnStatuses[p.sequence] = {
              index: p.stopIndex - 1,
              status: isDivergence ? "after-divergence" : "normal"
            };
            if (isDivergence) console.log(p.sequence, status.lastDrawnStatuses[p.sequence]);
          }
        });
      }
      // If number of patterns is more, then it is a convergence.
      // => don't draw this stop and start drawing the pattern(s) that is/are converging.
      // unless all converging patterns are first stop.
      else if (patternsForStop.length > prevPatternsForStop.length && prevPatternsForStop.length != 0) {
        status.lastDrawnStatuses[index].status = "before-convergence";
        // Also set the status to other common patterns so they don't get drawn as duplicate.
        prevPatternsForStop.forEach(p => {
          if (p.sequence > index) {
            status.lastDrawnStatuses[p.sequence].status = "before-convergence-parallel";
          }
        });
        
  
        console.log("before-convergence", index, status.lastDrawnStatuses[index]);
  
        // Draw patterns that are not previously common to this pattern.
        var levelOffset = 1;
        patternsForStop.forEach(p => {
          if (!prevPatternsForStop.find(p0 => p0.sequence == p.sequence) && status.lastDrawnStatuses[p.sequence].status != "before-convergence" && status.lastDrawnStatuses[p.sequence].status != "before-convergence-parallel") {
            //levelOffset++;
            if (p.stopIndex == 0) {
              status.lastDrawnStatuses[p.sequence] = {
                status: "before-convergence-parallel",
                index: -2
              };
            }
            else {
              otherBranches = this.drawRouteBranchContents(allSeqs, p.sequence, level + levelOffset, status, stats);
            }
          }
        });
  
        // If all convergent patterns that needed to be drawn have been drawn,
        // resume with the current stop at the lowest level.
        if (patternsForStop[0].sequence == index) {
          let junction = null;
          if (status.lastDrawnStatuses.filter(lds => lds.status != "before-convergence-parallel").length > 1) {
            junction = (
              <tr key={`${stopId}-convergence`}>
                <td colSpan={COLSPAN}></td>
                <td>
                  <span className="diagram-container">
                    <span className="diagram-line">					
                      <span className="convergence junction"></span>
                      <span className="convergence curve"></span>
                    </span>
                  </span>
                </td>
              </tr>
            )
          }
  
          var isThisTerminus = status.lastDrawnStatuses.filter(lds => lds.index == -2).length > 0;
  
          currentStop = (
            <>
            {junction}
            {this.printStopContent(seq_i, j, level, undefined, isThisTerminus, status, stats)}
            </>
          )
          status.lastDivergencePatterns = null;
          console.log("before-convergence complete", index, status.lastDrawnStatuses[index]);
        }
        else {
          // If this is not the lowest index, return so that the calling drawing process can proceed.
          console.log(`Returning to previous pattern from ${level}`);
          returnRequested = true
          return null //result;
        }
      }
  
      prevPatternsForStop = patternsForStop;

      return (
        <>
          {otherBranches}
          {currentStop}
        </>
      )
    })
  }

  printStopContent = (stops, index, level, higherLevels, isTerminus, status, stats) => {
    var st = stops[index];
    var nextStopParts = stops[index].name.split("@");
    var nextStopStreet = normalizeStreet(nextStopParts[0]);
    // Specific if stop name is formatted as "Main Street NW @ Other Street",
    // in which case stopStreet will be "Main Street".
    var stopParts = st.name.split("@");
  
    var stopStreet = index == 0
      ? normalizeStreet(stopParts[0])
      : nextStopStreet
  
    if (index + 1 < stops.length) {
      nextStopParts = stops[index + 1].name.split("@");
      nextStopStreet = normalizeStreet(nextStopParts[0]);
    }
  
    if (index > 0) {
      var previousStopParts = stops[index - 1].name.split("@");
      status.previousStreet = normalizeStreet(previousStopParts[0]);
    }
  
    var printNewStopStreet = false;
    var stopName;
    if (stopParts.length >= 2) {
      stopName = normalizeStreet(stopParts[1]);
  
      if (stopStreet != status.currentStreet && stopStreet != status.previousStreet) {
        status.currentStreet = stopStreet;
        if (index + 1 < stops.length && nextStopStreet == stopStreet) {
          printNewStopStreet = true;
        }
        else {
          stopName = st.name;
        }
      }
    }
    else {
      stopName = st.name;
      status.currentStreet = status.previousStreet;
      status.previousStreet = undefined;
    }
    var c = st.census;
    var amenityCols;
    stats.stopCount++;
    
    if (c) {
      var seating = c.seating.startsWith("Yes") ? icons.seating : null;
      var shelter = c.shelter.startsWith("Yes") ? icons.shelter : null;
      var trashCan = c.trash_can.startsWith("Yes") ? icons.trash : null;
      var noCrosswalks = c.main_street_crosswalk == "No" && c.cross_street_crosswalk == "No";
      var isAccessible =
        c.sidewalk != "No" // at least one sidewalk
        && (c.boarding_area == "Concrete sidewalk" || c.boarding_area == "Brick pavers") // solid boarding area
        && (noCrosswalks || c.curb_cuts == "Yes") // either no crosswalk or, if crosswalk, they must have curb cuts
        && c.obstacles == "No" // no obstacles
        ; // TODO add uneven sidewalk from addl comments.
      var accessible = isAccessible ? icons.accessible : null;
      var mainCrosswalk = c.main_street_crosswalk == "Yes" ? icons.crosswalk : null;
      var trafficLight = (/*c.traffic_light == "Yes" &&*/ c.crosswalk_signals == "Yes") ? icons.trafficLight : null;
  
      stats.surveyedCount++
      if (isAccessible) stats.accessible++
      if (trafficLight) stats.trafficLight++
      if (mainCrosswalk) stats.crosswalk++
      if (seating) stats.seating++
      if (shelter) stats.shelter++
      if (trashCan) stats.trash++
      stats.totalScore += c.score;
      
      amenityCols = (
        <>
          <td>{accessible}</td>
          <td>{trafficLight}</td>
          <td>{mainCrosswalk}</td>
          <td>{seating}</td>
          <td>{shelter}</td>
          <td>{trashCan}</td>
          <td>{getLetterGrade(c.score)}</td>
        </>
      )
    }
    else {
      amenityCols = <td className='gray-cell' colSpan={COLSPAN}></td>
    }
  
    var stopClass = "";
    if (index == 0) stopClass = "terminus first";
    else if (index == stops.length - 1) stopClass = "terminus last";
    else if (isTerminus) stopClass = "terminus";

    const diagram = (
      <>
        <Levels levels={level} />
        <span className={`diagram-line ${stopClass}`}></span>
        <span className='diagram-stop-symbol'></span>
        <Levels levels={higherLevels} />
      </>
    )

    let stopStreetContents = null;
    if (printNewStopStreet) {
      const diagramNewStreet = (
        <>
          <Levels levels={level} />
          <span className={`diagram-line ${stopClass}`}></span>
          <Levels levels={higherLevels} />
        </>
      )
      stopStreetContents = (
        <tr key={`${st.id}-new-street`}>
          <td className='gray-cell' colSpan={COLSPAN}></td>
          <td>
            <span className="diagram-container">{diagramNewStreet}
              <span className="new-route-street">{stopStreet.toLowerCase()}</span>
            </span>
          </td>
        </tr>
      )
    }
  
    return (
      <>
        {stopStreetContents}
        <tr key={st.id}>
            {amenityCols}
            <td>
              <span className="diagram-container">{diagram}
                <span>
                  <span className={`diagram-stop-name ${stopClass}`}>
                    {stopName.toLowerCase()}
                  </span> <small>{st.id}</small>
                </span>
              </span>
            </td>
        </tr>
      </>
    )
  }
    
  render () {
    const { match } = this.props
    const { id } = match.params
    const route = {
      agency_id: 'MARTA',
      route_long_name: 'Fulton Industrial',
      route_short_name: id
    }

    return (
      <>
        <div className='info-pane-header'>
          <h2><RouteLabel route={route} /></h2>
          <div>{route.route_long_name || ""}</div>
        </div>
        <Tabs defaultActiveKey='Overview' id='routeTabs'>
          <Tab eventKey='Overview' title='Overview'>Overview</Tab>
          {Object.values(stopsByDirection)
            .map(d => {
              const direction = DIRECTIONS[d.direction];
              return (
                <Tab eventKey={direction} key={direction} title={direction}>
                  <table className='trip-diagram'>
                    <tbody>
                      {this.renderRouteDiagram(d)}
                    </tbody>
                  </table>
                </Tab>
              )
            })
          }        
        </Tabs>
      </>
    )
  }
}

export default Route
