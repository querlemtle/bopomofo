/**
 * The $P Point-Cloud Recognizer (JavaScript version)
 *
 *  Radu-Daniel Vatavu, Ph.D.
 *  University Stefan cel Mare of Suceava
 *  Suceava 720229, Romania
 *  vatavu@eed.usv.ro
 *
 *  Lisa Anthony, Ph.D.
 *  UMBC
 *  Information Systems Department
 *  1000 Hilltop Circle
 *  Baltimore, MD 21250
 *  lanthony@umbc.edu
 *
 *  Jacob O. Wobbrock, Ph.D.
 *  The Information School
 *  University of Washington
 *  Seattle, WA 98195-2840
 *  wobbrock@uw.edu
 *
 * The academic publication for the $P recognizer, and what should be
 * used to cite it, is:
 *
 *     Vatavu, R.-D., Anthony, L. and Wobbrock, J.O. (2012).
 *     Gestures as point clouds: A $P recognizer for user interface
 *     prototypes. Proceedings of the ACM Int'l Conference on
 *     Multimodal Interfaces (ICMI '12). Santa Monica, California
 *     (October 22-26, 2012). New York: ACM Press, pp. 273-280.
 *     https://dl.acm.org/citation.cfm?id=2388732
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2012, Radu-Daniel Vatavu, Lisa Anthony, and
 * Jacob O. Wobbrock. All rights reserved. Last updated July 14, 2018.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University Stefan cel Mare of Suceava,
 *	University of Washington, nor UMBC, nor the names of its contributors
 *	may be used to endorse or promote products derived from this software
 *	without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Radu-Daniel Vatavu OR Lisa Anthony
 * OR Jacob O. Wobbrock BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
**/
//
// Point class
//
function Point(x, y, id) // constructor
{
	this.X = x;
	this.Y = y;
	this.ID = id; // stroke ID to which this point belongs (1,2,3,etc.)
}
//
// PointCloud class: a point-cloud template
//
function PointCloud(name, points) // constructor
{
	this.Name = name;
	this.Points = Resample(points, NumPoints);
	this.Points = Scale(this.Points);
	this.Points = TranslateTo(this.Points, Origin);
}
//
// Result class
//
function Result(name, score, ms) // constructor
{
	this.Name = name;
	this.Score = score;
	this.Time = ms;
}
//
// PDollarRecognizer constants
//
const NumPointClouds = 16;
const NumPoints = 32;
const Origin = new Point(0, 0, 0);
//
// PDollarRecognizer class
//
function PDollarRecognizer() // constructor
{
	//
	// one predefined point-cloud for each gesture
	//
	this.PointClouds = new Array(NumPointClouds);
	this.PointClouds[0] = new PointCloud("Bo", new Array(new Point(209, 76, 1), new Point(160, 139, 1), new Point(160, 135, 1), new Point(172, 133, 1), new Point(274, 137, 1), new Point(275, 139, 1), new Point(230, 232, 1), new Point(228, 232, 1), new Point(202, 207, 1)));

	this.PointClouds[1] = new PointCloud("Po", new Array(new Point(188, 65, 1), new Point(130, 115, 1), new Point(132, 116, 1), new Point(257, 111, 1), new Point(258, 111, 1), new Point(143, 208, 1), new Point(155, 152, 2), new Point(245, 221, 2)));

	this.PointClouds[2] = new PointCloud("Mo", new Array(new Point(115, 120, 1), new Point(115, 187, 1), new Point(117, 117, 2), new Point(220, 117, 2), new Point(218, 123, 2), new Point(215, 187, 2)));

	this.PointClouds[3] = new PointCloud("Fo", new Array(new Point(130, 85, 1), new Point(221, 90, 1), new Point(130, 88, 2), new Point(124, 165, 2), new Point(124, 161, 2), new Point(231, 159, 2)));

	this.PointClouds[4] = new PointCloud("Der", new Array(new Point(183, 80, 1), new Point(150, 111, 1), new Point(146, 115, 1), new Point(238, 118, 1), new Point(238, 115, 1), new Point(229, 205, 1), new Point(227, 207, 1), new Point(208, 175, 1), new Point(193, 119, 2), new Point(145, 189, 2)));

	this.PointClouds[5] = new PointCloud("Ter", new Array(new Point(116, 119, 1), new Point(254, 113, 1), new Point(195, 77, 2), new Point(147, 197, 2), new Point(144, 195, 2), new Point(222, 192, 2), new Point(218, 170, 3), new Point(227, 227, 3)));

	this.PointClouds[6] = new PointCloud("Ner", new Array(new Point(158, 71, 1), new Point(257, 75, 1), new Point(254, 77, 1), new Point(191, 126, 1), new Point(186, 125, 1), new Point(266, 125, 1), new Point(266, 125, 1), new Point(248, 232, 1), new Point(249, 233, 1), new Point(198, 211, 1)));

	this.PointClouds[7] = new PointCloud("Ler", new Array(new Point(156, 69, 1), new Point(122, 131, 1), new Point(120, 128, 1), new Point(269, 127, 1), new Point(268, 128, 1), new Point(248, 246, 1), new Point(246, 246, 1), new Point(211, 217, 1), new Point(213, 72, 2), new Point(122, 240, 2)));

	this.PointClouds[8] = new PointCloud("Ger", new Array(new Point(172, 91, 1), new Point(120, 171, 1), new Point(118, 169, 1), new Point(157, 220, 1), new Point(223, 107, 1), new Point(186, 162, 1), new Point(185, 162, 1), new Point(185, 163, 2), new Point(220, 229, 2)));

	this.PointClouds[9] = new PointCloud("Ker", new Array(new Point(139, 95, 1), new Point(218, 91, 1), new Point(182, 91, 2), new Point(149, 136, 2), new Point(146, 135, 2), new Point(208, 123, 2), new Point(209, 125, 2), new Point(203, 201, 2), new Point(203, 201, 2), new Point(150, 181, 2)));

	this.PointClouds[10] = new PointCloud("Her", new Array(new Point(139, 95, 1), new Point(254, 88, 1), new Point(142, 93, 2), new Point(101, 200, 2)));

	this.PointClouds[11] = new PointCloud("Ji", new Array(new Point(136, 87, 1), new Point(128, 155, 1), new Point(128, 152, 1), new Point(192, 149, 1), new Point(200, 82, 2), new Point(194, 209, 2)));

	this.PointClouds[12] = new PointCloud("Qui", new Array(new Point(228, 101, 1), new Point(166, 167, 1), new Point(166, 169, 1), new Point(220, 249, 1)));

	this.PointClouds[13] = new PointCloud("Xi", new Array(new Point(30, 7, 1), new Point(103, 7, 1), new Point(66, 7, 2), new Point(66, 87, 2)));

	this.PointClouds[14] = new PointCloud("Zhi", new Array(new Point(124, 93, 1), new Point(119, 159, 1), new Point(120, 157, 1), new Point(246, 159, 1), new Point(252, 97, 2), new Point(244, 157, 2), new Point(190, 87, 3), new Point(178, 197, 3), new Point(99, 199, 4), new Point(269, 211, 4)));

	this.PointClouds[15] = new PointCloud("Chi", new Array(new Point(200, 85, 1), new Point(146, 135, 1), new Point(234, 100, 2), new Point(134, 205, 2), new Point(204, 151, 3), new Point(190, 273, 3)));

	this.PointClouds[16] = new PointCloud("Shi", new Array(new Point(150, 123, 1), new Point(218, 125, 1), new Point(222, 127, 1), new Point(215, 175, 1), new Point(150, 173, 2), new Point(215, 179, 2), new Point(216, 179, 2), new Point(148, 175, 3), new Point(148, 183, 3), new Point(136, 210, 3), new Point(134, 214, 3), new Point(132, 217, 3), new Point(116, 235, 3), new Point(115, 237, 3)));

	this.PointClouds[17] = new PointCloud("Ri", new Array(new Point(143, 102, 1), new Point(143, 221, 1), new Point(140, 221, 2), new Point(272, 207, 2), new Point(146, 95, 2), new Point(263, 85, 2), new Point(264, 85, 3), new Point(272, 206, 3), new Point(196, 139, 4), new Point(224, 169, 4)));

	this.PointClouds[18] = new PointCloud("Zi", new Array(new Point(173, 136, 1), new Point(278, 125, 1), new Point(280, 126, 1), new Point(276, 191, 1), new Point(276, 191, 1), new Point(246, 175, 1), new Point(227, 127, 2), new Point(227, 277, 2)));

	this.PointClouds[19] = new PointCloud("Ci", new Array(new Point(142, 112, 1), new Point(272, 113, 1), new Point(211, 94, 2), new Point(159, 157, 2), new Point(153, 163, 2), new Point(252, 162, 2), new Point(252, 163, 2), new Point(192, 229, 2)));

	this.PointClouds[20] = new PointCloud("Si", new Array(new Point(179, 108, 1), new Point(142, 213, 1), new Point(138, 213, 1), new Point(241, 210, 1), new Point(238, 193, 2), new Point(252, 227, 2)));

	this.PointClouds[21] = new PointCloud("Yi", new Array(new Point(12, 347, 1), new Point(119, 347, 1)));
	
	this.PointClouds[22] = new PointCloud("Wu", new Array(new Point(30, 146, 1), new Point(106, 222, 1), new Point(30, 225, 2), new Point(106, 146, 2)));

	this.PointClouds[23] = new PointCloud("Yu", new Array(new Point(130, 116, 1), new Point(130, 206, 1), new Point(132, 206, 1), new Point(250, 217, 1), new Point(256, 119, 2), new Point(246, 214, 2)));

	this.PointClouds[24] = new PointCloud("A", new Array(new Point(131, 121, 1), new Point(182, 187, 1), new Point(241, 121, 2), new Point(191, 186, 2), new Point(187, 189, 3), new Point(186, 315, 3)));

	this.PointClouds[25] = new PointCloud("O", new Array(new Point(170, 112, 1), new Point(211, 110, 1), new Point(273, 109, 1), new Point(303, 110, 1), new Point(338, 109, 1), new Point(358, 112, 1), new Point(270, 112, 2), new Point(268, 145, 2), new Point(268, 155, 2), new Point(266, 169, 2), new Point(266, 171, 2), new Point(254, 183, 2), new Point(245, 182, 2), new Point(240, 182, 2), new Point(210, 189, 2), new Point(191, 203, 2), new Point(189, 205, 2), new Point(187, 207, 2), new Point(182, 215, 2), new Point(182, 217, 2), new Point(181, 220, 2), new Point(181, 223, 2), new Point(181, 225, 2), new Point(181, 227, 2), new Point(182, 235, 2), new Point(184, 239, 2), new Point(186, 242, 2), new Point(188, 245, 2), new Point(190, 248, 2), new Point(192, 250, 2), new Point(205, 261, 2), new Point(212, 265, 2), new Point(218, 269, 2), new Point(223, 273, 2), new Point(224, 275, 2), new Point(230, 279, 2), new Point(236, 281, 2), new Point(243, 284, 2), new Point(247, 285, 2), new Point(252, 286, 2), new Point(256, 287, 2), new Point(283, 291, 2), new Point(288, 291, 2), new Point(290, 291, 2), new Point(292, 291, 2), new Point(295, 291, 2), new Point(297, 291, 2), new Point(299, 291, 2), new Point(302, 290, 2), new Point(304, 289, 2), new Point(307, 288, 2), new Point(309, 287, 2), new Point(311, 286, 2), new Point(314, 285, 2), new Point(321, 281, 2), new Point(325, 277, 2), new Point(326, 275, 2), new Point(328, 271, 2), new Point(330, 270, 2)));

	this.PointClouds[26] = new PointCloud("E", new Array(new Point(136, 137, 1), new Point(162, 132, 1), new Point(192, 128, 1), new Point(226, 126, 1), new Point(286, 129, 1), new Point(302, 128, 1), new Point(230, 88, 2), new Point(230, 89, 2), new Point(230, 91, 2), new Point(230, 94, 2), new Point(230, 97, 2), new Point(230, 99, 2), new Point(230, 101, 2), new Point(230, 105, 2), new Point(231, 109, 2), new Point(232, 113, 2), new Point(233, 117, 2), new Point(234, 121, 2), new Point(234, 126, 2), new Point(234, 129, 2), new Point(234, 133, 2), new Point(235, 137, 2), new Point(235, 140, 2), new Point(235, 143, 2), new Point(235, 149, 2), new Point(235, 151, 2), new Point(235, 153, 2), new Point(235, 155, 2), new Point(236, 157, 2), new Point(236, 159, 2), new Point(236, 161, 2), new Point(236, 163, 2), new Point(236, 164, 2), new Point(236, 165, 2), new Point(236, 166, 2), new Point(236, 167, 2), new Point(237, 167, 2), new Point(237, 168, 2), new Point(235, 169, 2), new Point(234, 169, 2), new Point(230, 169, 2), new Point(228, 169, 2), new Point(221, 170, 2), new Point(202, 174, 2), new Point(188, 180, 2), new Point(186, 181, 2), new Point(182, 182, 2), new Point(179, 185, 2), new Point(176, 188, 2), new Point(176, 189, 2), new Point(174, 192, 2), new Point(172, 197, 2), new Point(171, 200, 2), new Point(171, 208, 2), new Point(174, 216, 2), new Point(174, 219, 2), new Point(176, 220, 2), new Point(180, 227, 2), new Point(182, 229, 2), new Point(183, 231, 2), new Point(191, 235, 2), new Point(193, 237, 2), new Point(195, 237, 2), new Point(206, 241, 2), new Point(208, 242, 2), new Point(210, 243, 2), new Point(220, 246, 2), new Point(222, 246, 2), new Point(228, 246, 2), new Point(236, 246, 2), new Point(238, 246, 2), new Point(241, 245, 2), new Point(246, 244, 2), new Point(250, 242, 2), new Point(252, 241, 2)));

	this.PointClouds[27] = new PointCloud("Eh", new Array(new Point(107, 198, 1), new Point(230, 199, 1), new Point(206, 170, 2), new Point(190, 264, 2), new Point(140, 173, 3), new Point(126, 298, 3), new Point(128, 297, 3), new Point(253, 300, 3)));

	this.PointClouds[28] = new PointCloud("Ai", new Array(new Point(108, 125, 1), new Point(186, 124, 1), new Point(130, 131, 2), new Point(88, 176, 2), new Point(84, 176, 2), new Point(184, 171, 2), new Point(187, 171, 2), new Point(144, 236, 2), new Point(148, 130, 3), new Point(98, 223, 3)));

	this.PointClouds[29] = new PointCloud("Ei", new Array(new Point(164, 207, 1), new Point(206, 181, 1), new Point(210, 180, 1), new Point(213, 198, 1), new Point(214, 207, 1), new Point(246, 279, 1), new Point(248, 281, 1), new Point(259, 296, 1), new Point(260, 298, 1), new Point(262, 303, 1), new Point(262, 304, 1), new Point(264, 305, 1), new Point(264, 307, 1), new Point(264, 307, 1)));

	this.PointClouds[30] = new PointCloud("Ao", new Array(new Point(154, 114, 1), new Point(118, 178, 1), new Point(117, 177, 1), new Point(162, 175, 1), new Point(203, 129, 2), new Point(126, 244, 2), new Point(124, 249, 2), new Point(222, 227, 2), new Point(220, 211, 3), new Point(238, 249, 3)));

	this.PointClouds[31] = new PointCloud("Ou", new Array(new Point(172, 163, 1), new Point(234, 153, 1), new Point(235, 154, 1), new Point(157, 256, 1), new Point(164, 196, 2), new Point(243, 253, 2)));

	this.PointClouds[32] = new PointCloud("An", new Array(new Point(137, 129, 1), new Point(147, 129, 1), new Point(160, 127, 1), new Point(200, 125, 1), new Point(220, 124, 1), new Point(223, 124, 1), new Point(224, 123, 1), new Point(230, 123, 1), new Point(232, 122, 1), new Point(232, 124, 1), new Point(230, 127, 1), new Point(217, 152, 1), new Point(214, 157, 1), new Point(212, 160, 1), new Point(207, 167, 1), new Point(202, 173, 1), new Point(164, 131, 2), new Point(162, 131, 2), new Point(160, 135, 2), new Point(158, 139, 2), new Point(156, 142, 2), new Point(148, 153, 2), new Point(144, 159, 2), new Point(143, 161, 2), new Point(140, 165, 2), new Point(138, 167, 2), new Point(138, 168, 2), new Point(139, 169, 2), new Point(146, 171, 2), new Point(154, 173, 2), new Point(180, 175, 2), new Point(186, 175, 2), new Point(194, 175, 2), new Point(202, 176, 2), new Point(210, 176, 2), new Point(217, 176, 2), new Point(224, 176, 2), new Point(248, 176, 2), new Point(250, 176, 2), new Point(252, 177, 2), new Point(252, 177, 2), new Point(256, 177, 2), new Point(257, 177, 2), new Point(258, 177, 2), new Point(256, 187, 2), new Point(246, 201, 2), new Point(241, 207, 2), new Point(236, 213, 2), new Point(233, 217, 2), new Point(230, 221, 2), new Point(227, 225, 2), new Point(224, 227, 2), new Point(221, 231, 2), new Point(218, 233, 2), new Point(209, 239, 2), new Point(208, 240, 2)));

	this.PointClouds[33] = new PointCloud("En", new Array(new Point(188, 143, 1), new Point(148, 210, 1), new Point(151, 205, 1), new Point(236, 201, 1), new Point(241, 204, 1), new Point(176, 295, 1)));

	this.PointClouds[34] = new PointCloud("Ang", new Array(new Point(152, 153, 1), new Point(256, 143, 1), new Point(203, 124, 2), new Point(203, 126, 2), new Point(199, 153, 2), new Point(190, 176, 2), new Point(182, 193, 2), new Point(180, 201, 2), new Point(170, 221, 2), new Point(163, 228, 2), new Point(161, 229, 2), new Point(158, 233, 2), new Point(157, 234, 2), new Point(156, 235, 2), new Point(152, 238, 2), new Point(152, 238, 2), new Point(150, 237, 2), new Point(204, 156, 3), new Point(214, 228, 3), new Point(216, 229, 3), new Point(310, 224, 3)));

	this.PointClouds[35] = new PointCloud("Eng", new Array(new Point(198, 139, 1), new Point(167, 237, 1), new Point(166, 235, 1), new Point(296, 237, 1)));

	this.PointClouds[36] = new PointCloud("Er", new Array(new Point(160, 98, 1), new Point(158, 119, 1), new Point(121, 206, 1), new Point(112, 220, 1), new Point(108, 225, 1), new Point(106, 228, 1), new Point(101, 235, 1), new Point(98, 238, 1), new Point(96, 242, 1), new Point(92, 247, 1), new Point(210, 98, 2), new Point(201, 203, 2), new Point(202, 238, 2), new Point(202, 235, 2), new Point(236, 245, 2), new Point(273, 245, 2), new Point(282, 245, 2), new Point(283, 244, 2)));
	//
	// The $P Point-Cloud Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), DeleteUserGestures()
	//
	this.Recognize = function (points) {
		var t0 = Date.now();
		var candidate = new PointCloud("", points);

		var u = -1;
		var b = +Infinity;
		for (var i = 0; i < this.PointClouds.length; i++) // for each point-cloud template
		{
			var d = GreedyCloudMatch(candidate.Points, this.PointClouds[i]);
			if (d < b) {
				b = d; // best (least) distance
				u = i; // point-cloud index
			}
		}
		var t1 = Date.now();
		return (u == -1) ? new Result("No match.", 0.0, t1 - t0) : new Result(this.PointClouds[u].Name, b > 1.0 ? 1.0 / b : 1.0, t1 - t0);
	};
	this.AddGesture = function (name, points) {
		this.PointClouds[this.PointClouds.length] = new PointCloud(name, points);
		var num = 0;
		for (var i = 0; i < this.PointClouds.length; i++) {
			if (this.PointClouds[i].Name == name)
				num++;
		}
		return num;
	};
	this.DeleteUserGestures = function () {
		this.PointClouds.length = NumPointClouds; // clears any beyond the original set
		return NumPointClouds;
	};
}
//
// Private helper functions from here on down
//
function GreedyCloudMatch(points, P) {
	var e = 0.50;
	var step = Math.floor(Math.pow(points.length, 1.0 - e));
	var min = +Infinity;
	for (var i = 0; i < points.length; i += step) {
		var d1 = CloudDistance(points, P.Points, i);
		var d2 = CloudDistance(P.Points, points, i);
		min = Math.min(min, Math.min(d1, d2)); // min3
	}
	return min;
}
function CloudDistance(pts1, pts2, start) {
	var matched = new Array(pts1.length); // pts1.length == pts2.length
	for (var k = 0; k < pts1.length; k++)
		matched[k] = false;
	var sum = 0;
	var i = start;
	do {
		var index = -1;
		var min = +Infinity;
		for (var j = 0; j < matched.length; j++) {
			if (!matched[j]) {
				var d = Distance(pts1[i], pts2[j]);
				if (d < min) {
					min = d;
					index = j;
				}
			}
		}
		matched[index] = true;
		var weight = 1 - ((i - start + pts1.length) % pts1.length) / pts1.length;
		sum += weight * min;
		i = (i + 1) % pts1.length;
	} while (i != start);
	return sum;
}
function Resample(points, n) {
	var I = PathLength(points) / (n - 1); // interval length
	var D = 0.0;
	var newpoints = new Array(points[0]);
	for (var i = 1; i < points.length; i++) {
		if (points[i].ID == points[i - 1].ID) {
			var d = Distance(points[i - 1], points[i]);
			if ((D + d) >= I) {
				var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
				var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
				var q = new Point(qx, qy, points[i].ID);
				newpoints[newpoints.length] = q; // append new point 'q'
				points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
				D = 0.0;
			}
			else D += d;
		}
	}
	if (newpoints.length == n - 1) // sometimes we fall a rounding-error short of adding the last point, so add it if so
		newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y, points[points.length - 1].ID);
	return newpoints;
}
function Scale(points) {
	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
	for (var i = 0; i < points.length; i++) {
		minX = Math.min(minX, points[i].X);
		minY = Math.min(minY, points[i].Y);
		maxX = Math.max(maxX, points[i].X);
		maxY = Math.max(maxY, points[i].Y);
	}
	var size = Math.max(maxX - minX, maxY - minY);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = (points[i].X - minX) / size;
		var qy = (points[i].Y - minY) / size;
		newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
	}
	return newpoints;
}
function TranslateTo(points, pt) // translates points' centroid to pt
{
	var c = Centroid(points);
	var newpoints = new Array();
	for (var i = 0; i < points.length; i++) {
		var qx = points[i].X + pt.X - c.X;
		var qy = points[i].Y + pt.Y - c.Y;
		newpoints[newpoints.length] = new Point(qx, qy, points[i].ID);
	}
	return newpoints;
}
function Centroid(points) {
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return new Point(x, y, 0);
}
function PathLength(points) // length traversed by a point path
{
	var d = 0.0;
	for (var i = 1; i < points.length; i++) {
		if (points[i].ID == points[i - 1].ID)
			d += Distance(points[i - 1], points[i]);
	}
	return d;
}
function Distance(p1, p2) // Euclidean distance between two points
{
	var dx = p2.X - p1.X;
	var dy = p2.Y - p1.Y;
	return Math.sqrt(dx * dx + dy * dy);
}

export { Point, PointCloud, Result, PDollarRecognizer };